import type { Card, Suit } from './card';
import { createDeck, shuffle, Rng } from './deck';
import { Pile } from './pile';
import { canMoveStack as canMoveStackRule, shouldFlipTopCard, flipCard } from './rules';
import { createMoveStackRecord, createDealRowRecord, type MoveRecord } from './move';

export interface SpiderOptions {
    columns?: number;
    numSuits?: 1 | 2 | 4;
    numDecks?: number;
    rng?: Rng;
}

// Move interface is now defined in move.ts
export type { MoveRecord as Move } from './move';

export class GameState {
    readonly columns: number;
    readonly numSuits: 1 | 2 | 4;
    readonly numDecks: number;
    private readonly rng: Rng;

    tableau: Pile[];       // 10 列牌面
    stock: Card[];         // 库牌（用于发行整行）
    completed: Card[][];   // 已完成的 K→A 顺子堆
    moves: MoveRecord[];   // 操作历史（撤销/重做用）

    constructor(options: SpiderOptions = {}) {
        this.columns = options.columns ?? 10;
        this.numSuits = options.numSuits ?? 1;
        this.numDecks = options.numDecks ?? 2;
        this.rng = options.rng ?? Math.random;
    
        this.tableau = [];
        this.stock = [];
        this.completed = [];
        this.moves = [];
    
        this.initialize();

      }
    
    private initialize(): void {
    // 1) 生成并洗牌
        const deck = shuffle(createDeck({ numSuits: this.numSuits, numDecks: this.numDecks }), this.rng);

        // 2) 初始牌面：
        //    Spider 规则：前 4 列发 6 张，其余 6 列发 5 张；每列最上面一张翻面
        const initialDealCounts = this.columns === 10
            ? [6, 6, 6, 6, 5, 5, 5, 5, 5, 5]
            : Array.from({ length: this.columns }, () => 5); // 兜底

        let cursor = 0;
        this.tableau = Array.from({ length: this.columns }, () => new Pile());

        for (let col = 0; col < this.columns; col++) {
            const count = initialDealCounts[col] ?? 5;
            const pileCards: Card[] = [];
            for (let i = 0; i < count; i++) {
            const c = deck[cursor++];
                pileCards.push({ ...c, faceUp: i === count - 1 }); // 仅顶牌翻面
            }
            this.tableau[col] = new Pile(pileCards);
        }

        // 3) 剩余作为库存（用于每次“发一行”）
        this.stock = deck.slice(cursor);
    }

    /**
     * Deal a row of cards (one card to each column)
     */
    dealRow(): void {
        if (!this.canDealRow()) return;

        const dealtCards: Card[] = [];
        for (let col = 0; col < this.columns; col++) {
            const top = this.stock.pop();
            if (top) {
                const faceUpCard = { ...top, faceUp: true };
                this.tableau[col].push(faceUpCard);
                dealtCards.push(faceUpCard);
            }
        }

        // Record the move
        const moveRecord = createDealRowRecord(dealtCards);
        this.moves.push(moveRecord);
    }
    
    canDealRow(): boolean {
        // 典型规则：所有列都必须至少有一张牌才允许再发一行
        const allNonEmpty = this.tableau.every(pile => pile.length > 0);
        return allNonEmpty && this.stock.length >= this.columns;
      }
    
    /**
     * Check if a stack of cards can be moved from one column to another
     */
    canMoveStack(fromCol: number, count: number, toCol: number): boolean {
        // Validate column indices
        if (fromCol < 0 || fromCol >= this.columns || toCol < 0 || toCol >= this.columns) {
            return false;
        }

        // Cannot move to the same column
        if (fromCol === toCol) {
            return false;
        }

        const fromPile = this.tableau[fromCol];
        const toPile = this.tableau[toCol];

        // Use rules to validate the move
        return canMoveStackRule(fromPile, count, toPile);
    }

    /**
     * Move a stack of cards from one column to another
     * Returns true if the move was successful, false otherwise
     */
    moveStack(fromCol: number, count: number, toCol: number): boolean {
        if (!this.canMoveStack(fromCol, count, toCol)) {
            return false;
        }

        const fromPile = this.tableau[fromCol];
        const toPile = this.tableau[toCol];

        // Take the cards from the source pile
        const movedCards = fromPile.takeDescendingRun(count);

        // Check if we need to flip a card in the source column
        let flippedCard: Card | undefined;
        if (shouldFlipTopCard(fromPile)) {
            const top = fromPile.peek();
            if (top) {
                flippedCard = top;
                // Flip the top card by replacing it
                const allCards = fromPile.toArray();
                allCards[allCards.length - 1] = flipCard(allCards[allCards.length - 1]!);
                // Rebuild the pile
                while (fromPile.length > 0) {
                    fromPile.pop();
                }
                for (const card of allCards) {
                    fromPile.push(card);
                }
            }
        }

        // Add cards to the target pile
        toPile.pushMany(movedCards);

        // Record the move
        const moveRecord = createMoveStackRecord(fromCol, toCol, count, movedCards, flippedCard);
        this.moves.push(moveRecord);

        // Check if we can collect a complete sequence from the target column
        this.tryCollectCompleteSequence(toCol);

        return true;
    }

    /** 检查某列顶端是否形成完整 K→A 顺子，若是则收集到 completed（骨架） */
    tryCollectCompleteSequence(col: number): boolean {
        const pile = this.tableau[col];
        const sequence = pile.collectCompleteSequence();
        if (!sequence || sequence.length === 0) {
        return false;
        }
        this.completed.push(sequence);
        return true;
    }

    /** 游戏是否胜利（所有顺子已收集完） */
    isWon(): boolean {
        // 两副牌共 8 条完整顺子
        const target = (52 * this.numDecks) / 13;
        return this.completed.length === target;
    }

}