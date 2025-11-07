import type { Card, Suit } from './card';
import { createDeck, shuffle, Rng } from './deck';
import { Pile } from './pile';

export interface SpiderOptions {
    columns?: number;
    numSuits?: 1 | 2 | 4;
    numDecks?: number;
    rng?: Rng;
}

export interface Move {
    kind: 'move' | 'deal' | 'undo' | 'redo';
    payload?: unknown;
}

export class GameState {
    readonly columns: number;
    readonly numSuits: 1 | 2 | 4;
    readonly numDecks: number;
    private readonly rng: Rng;

    tableau: Pile[];       // 10 列牌面
    stock: Card[];         // 库牌（用于发行整行）
    completed: Card[][];   // 已完成的 K→A 顺子堆
    moves: Move[];         // 操作历史（撤销/重做用）

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

    /** 发一行：每列发一张，若库存不足或列为空顶牌朝下等细则，留待规则完善 */
    dealRow(): void {
        if (!this.canDealRow()) return;
        for (let col = 0; col < this.columns; col++) {
            const top = this.stock.pop();
            if (top) {
                // 规则：发到每列顶部，发出的牌应为翻面
                this.tableau[col].push({ ...top, faceUp: true });
            }
        }
        this.moves.push({ kind: 'deal' });
      }
    
    canDealRow(): boolean {
        // 典型规则：所有列都必须至少有一张牌才允许再发一行
        const allNonEmpty = this.tableau.every(pile => pile.length > 0);
        return allNonEmpty && this.stock.length >= this.columns;
      }
    
        /** 判定是否可以把某列顶部连续降序、同花色的若干牌移动到另一列顶部（骨架） */
    canMoveStack(fromCol: number, count: number, toCol: number): boolean {
        // TODO: 检查 fromCol 顶部 count 张是否全部翻面、严格降序且同花色；
        //       并检查能否接到 toCol 顶牌上（或空列规则）。
        return false;
    }

      /** 执行移动（骨架） */
    moveStack(fromCol: number, count: number, toCol: number): void {
        if (!this.canMoveStack(fromCol, count, toCol)) return;
        // TODO: 真正移动 + 若暴露的新顶牌应翻面 + 记录 moves
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