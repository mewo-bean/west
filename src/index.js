import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

function isLad(card) {
    return card instanceof Lad;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isLad(card) && (
        Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature')
        || Lad.prototype.hasOwnProperty('modifyTakenDamage')
    )) {
        return 'Чем их больше, тем они сильнее';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = "Мирная утка", maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }

}


// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Пес-бандит", maxPower = 3, image = null) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name = 'Trasher', maxPower = 5, image = null) {
        super(name, maxPower, image);
    }
    
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }

    getDescriptions() {
        return ['Trasher', ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor(name = "Gatling", maxPower = 6, image = null) {
        super(name, maxPower, image);
        this.currentPower = 2;
    }
    
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        
        for (let pos = 0; pos < gameContext.oppositePlayer.table.length; pos++) {
            const oppositeCard = gameContext.oppositePlayer.table[pos];
            taskQueue.push(onDone => this.view.showAttack(onDone));
            taskQueue.push(onDone => {
                if (oppositeCard) {
                    this.dealDamageToCreature(this.currentPower, oppositeCard, gameContext, onDone);
                } else {
                    onDone();
                }
            });
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor(name = "Браток", maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation();
    }
    
    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation();
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    };

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(Math.max(value - Lad.getBonus(), 0));
    };
    
    getDescriptions() {
        return ['Браток', ...super.getDescriptions()];
    }
    
    static getBonus() {
        const v = this.getInGameCount();
        return v * (v + 1) / 2;
    }
    
    static getInGameCount() {
        return this.inGameCount || 0;
    }
    
    static setInGameCount(value) {
        this.inGameCount = value;
    }
}

class Rogue extends Creature {
    constructor(name = "Изгой", maxPower = 3, image = null) {
        super(name, maxPower, image);
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Lad(),
    new Lad(),
    new Lad(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
