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

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    getDescriptions() {
        getCreatureDescription()
        return 
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super();
        this.name = "Мирная утка";
        this.currentPower = 2;
    }

    quacks() {
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }

}


// Основа для собаки.
class Dog extends Creature {
    constructor() {
        super();
        this.name = "Пес-бандит";
        this.currentPower = 3;
    }
}

class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Trasher';
        this.maxPower = 5;
        this.currentPower = 5;
    }
    
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => continuation(value - 1));
    }
    
    getDescriptions() {
        return super.getDescriptions().concat([super.getInheritanceDescription(this)]);
    }
}

class Gatling extends Creature {
    constructor() {
        super();
        this.name = 'Gatling';
        this.maxPower = 6;
        this.currentPower = 6;
    }
    
    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        
        for (let oppositeCard of gameContext.oppositePlayer.table) {
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

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
