"use strict"

var Weapon = require("./weapon");
var Power = require("./powerup");
var wpn = require("../global").constants.WEAPON;
var pwr = require("../global").constants.POWERUP;
var Map = require("./map");

class Player {
    constructor(x, y, cell, id, isBot) {
        this.id = id;
        this.name;
        this.radius = 15 /*px*/;
        this.posX = x;
        this.posY = y;
        this.isBot = isBot;
        this.botVision = 400;
        this.botTetta = 0;
        this.angle = 0;
        this.health = 100;
        this.cell = cell;
        this.weapon = {};
        this.currentWeapon;
        this.powerup;
        this.isShield = false;
        this.velocity = 5;
        this.radKoeff = Math.PI / 180;
        this.skin = randomInteger(0, 2);

        this.actions = {
            mouse_X: 0,
            mouse_Y: 0,
            mouse_down: false,
            mouse_wheel: 0,
            up: true,
            down: false,
            left: false,
            right: false
        };

        this.setSimpleWeapon();
    }

    collideLeft(collobj) {
        if (collobj.isBlock) {
            let dist = (this.posX - this.radius) - (collobj.PosX + collobj.size);
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collideRight(collobj) {
        if (collobj.isBlock) {
            let dist = (collobj.PosX - collobj.size) - (this.posX + this.radius);
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collideTop(collobj) {
        if (collobj.isBlock) {
            let dist = (this.posY - this.radius) - (collobj.PosY + collobj.size);
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collideBottom(collobj) {
        if (collobj.isBlock) {
            let dist = (collobj.PosY - collobj.size) - (this.posY + this.radius)
            if (dist >= 0) {
                return false
            }
            else {
                return true
            }
        }
    }

    collidePlayer(player) {
        var XColl = false;
        var YColl = false;
        if ((this.posX + this.radius >= player.posX) && (this.posX <= player.posX + player.radius)) XColl = true;
        if ((this.posY + this.radius >= player.posY) && (this.posY <= player.posY + player.radius)) YColl = true;

        if (XColl & YColl) {
            return true;
        }
        return false;
    }

    isInArea(area, player) {
        return this.countDistToObject(player) < this.botVision;
    }

    setCustomWeapon(weapon) {
        if (weapon === undefined) {
            return;
        }
        this.weapon[weapon] = new Weapon(weapon);
        this.currentWeapon = this.weapon[weapon];
        this.currentWeapon.setPlayer(this.id);
    }

    setSimpleWeapon() {
        this.weapon [wpn.SIMPLE] = new Weapon(wpn.SIMPLE);
        this.weapon [wpn.MEDIUM] = new Weapon(wpn.MEDIUM);
        this.weapon [wpn.MEDIUM].patrons = 0;
        this.weapon [wpn.STRONG] = new Weapon(wpn.STRONG);
        this.weapon [wpn.STRONG].patrons = 0;
        this.currentWeapon = this.weapon [wpn.SIMPLE];
        this.currentWeapon.setPlayer(this.id);
    }

    setPower(power) {
        if (power === undefined) {
            this.powerup = null;
            return;
        }
        this.powerup = power;
        this.usePowerUp()
    }

    usePowerUp() {
        switch (this.powerup.type) {
            case wpn.MEDIUM:
                this.setCustomWeapon(wpn.MEDIUM);
                break;
            case wpn.STRONG:
                this.setCustomWeapon(wpn.STRONG);
                break;
            case pwr.PATRONS:
                for (let type in this.weapon) {
                    let weapon = this.weapon[type];
                    if (weapon.patrons === wpn.wpn_desc[weapon.type].patrons) {
                        //DO NOTHING
                    }
                    else {
                        weapon.patrons = wpn.wpn_desc[weapon.type].patrons;
                    }
                }
                break;

            case pwr.HEALTH:
                // if (this.health === 100) {
                //     //DO NOTHING
                // } else if ((this.health + 25) > 100) {
                //     this.health = 100;
                // } else {
                this.health += 25;
                // }
                console.log("Powerup in use: HEALTH");
                break;
            case pwr.SHIELD:
                if (!this.isShield) {
                    this.isShield = true;
                    //DO NOTHING
                }
                console.log("Powerup in use: SHIELD");
                break;
            case pwr.SPEED:
                if (this.velocity === 10) {
                    //DO NOTHING
                } else {
                    this.velocity += 5;
                }
                console.log("Powerup in use: SPEED");
                break;
            case pwr.BERSERC:
                if (this.weapon.damage === 2 * this.weapon.permanentDamage) {
                    //DO NOTHING
                } else {
                    this.weapon.setDamage(2 * this.weapon.permanentDamage);
                }
                console.log("Powerup in use: BERSERC");
                break;
        }
        setTimeout(() => {
            this.restoreDefaults();
            this.powerup = null;
        }, this.powerup.duration);
    }


    restoreDefaults() {
        this.velocity = 5;
        this.isShield = false;
        this.currentWeapon.restoreDamage();
    }


    //FOR AI
    startFire() {
        // console.log("Bot shoot");
        this.actions.mouse_down = true;
    }

    stopFire() {
        this.actions.mouse_down = false;
    }

    startGoLeft() {
        // console.log("Bot moves left");
        this.actions.left = true;
    }

    stopGoLeft() {
        this.actions.left = false;
    }

    startGoRight() {
        // console.log("Bot moves right");
        this.actions.right = true;
    }

    stopGoRight() {
        this.actions.right = false;
    }


    startGoUp() {
        // console.log("Bot moves up");
        this.actions.up = true;
    }

    stopGoUp() {
        this.actions.up = false;
    }

    startGoDown() {
        // console.log("Bot moves down");
        this.actions.down = true;
    }

    stopGoDown() {
        this.actions.down = false;
    }


    aimOnPlayer(player) {
        let accuracy = Math.random() * 5;
        this.actions.mouse_X = player.posX + accuracy;
        this.actions.mouse_Y = player.posY + accuracy;
        // console.log(this.actions.mouse_X);
        // console.log(this.actions.mouse_Y);
    }

    setDeffaultActions() {
        this.stopGoDown();
        this.stopGoUp();
        this.stopGoLeft();
        this.stopGoRight();
    }

    seek(player) {
        let distX = player.posX;
        let distY = player.posY;
        if (this.posX < distX) {
            this.startGoRight();
        }
        if (this.posX > distX) {
            this.startGoLeft();
        }
        if (this.posY < distY) {
            this.startGoDown()
        }
        if (this.posY > distY) {
            this.startGoUp();
        }
    }

    hide(player) {
        let distX = player.posX;
        let distY = player.posY;
        if (this.posX > distX) {
            this.startGoRight();
        }
        if (this.posX < distX) {
            this.startGoLeft();
        }
        if (this.posY > distY) {
            this.startGoDown()
        }
        if (this.posY < distY) {
            this.startGoUp();
        }
    }

    wanderToPlayer(player) {
        console.log("Distance between is", this.countDistToObject(player));
        let minDist = Math.random() * (this.radius + 200 - this.radius + player.radius) + this.radius + player.radius;
        if ((this.countDistToObject(player) >= minDist ) && (this.health >= player.health)) {
            this.seek(player);
        } else {
            this.hide(player);
        }
    }

    //HARD TO IMPLEMENT
    cleverWander(player, map) {
        let minDist = Math.random() * (this.radius + 200 - this.radius + player.radius) + this.radius + player.radius;
        let needSeek = (this.countDistToObject(player) >= minDist ) && (this.health >= player.health);
        let distX = player.posX;
        let distY = player.posY;
        let distAngle = this.getAngle(distX, distY);
        let sourceX = this.posX;
        let sourceY = this.posY;
        let testX = sourceX + this.radius * Math.cos(distAngle + this.botTetta);
        let testY = sourceY + this.radius * Math.sin(distAngle + this.botTetta);
        let cell = map.getCellByPoint(testX, testY);
        if (cell && cell.isBlock) {
            this.botTetta += 10 * this.radKoeff;
        } else {
            if (this.botTetta !== 0) {
                if (sourceY > distY) {
                    this.botTetta -= 10 * this.radKoeff;
                } else {
                    this.botTetta += 10 * this.radKoeff;
                }
            }
        }
        if (needSeek) {
            this.seek(player);
        } else {
            this.hide(player);
        }

    }
    cleverWanderPower(power, map) {

        let distX = power.posX;
        let distY = power.posY;
        let distAngle = this.getAngle(distX, distY);
        let sourceX = this.posX;
        let sourceY = this.posY;
        let testX = sourceX + this.radius * Math.cos(distAngle + this.botTetta);
        let testY = sourceY + this.radius * Math.sin(distAngle + this.botTetta);
        let cell = map.getCellByPoint(testX, testY);
        if (cell && cell.isBlock) {
            this.botTetta += 10 * this.radKoeff;
        } else {
            if (this.botTetta !== 0) {
                if (sourceY > distY) {
                    this.botTetta -= 10 * this.radKoeff;
                } else {
                    this.botTetta += 10 * this.radKoeff;
                }
            }
        }
            this.seek(power);
    }

    countDistToObject(object) {
        let dx = this.posX - object.posX;
        let dy = this.posY - object.posY;
        let result = Math.sqrt(dx * dx + dy * dy);
        return result;
    }

    //call from server
    makeDesicions(players, powerups, map) {
        this.setDeffaultActions();
        let minDist = 100000;
        let nearestPlayer = null;
        let powerupInArea = null;
        let onMisledPlayer = null;

        for (let playerId in players) {
            let player = players[playerId];
            if (player.id === this.id) continue;
            let dist = this.countDistToObject(player);
            // console.log("Dist from", this.id, ":", dist, "Min dist to", player.id, ":", minDist)
            if (dist < minDist) {
                minDist = dist;
                nearestPlayer = player;
            }
            if (this.isInArea(this.botVision, player) && !this.isBehindWall(player, map)) {
                onMisledPlayer = player;
                this.aimOnPlayer(onMisledPlayer);
                this.startFire();
                break;
            }
        }
        for (let pws of powerups) {
            if (this.countDistToObject(pws) < this.botVision) {
                powerupInArea = pws;
                break;
            }
        }
        if (onMisledPlayer === null) this.stopFire();
        if (powerupInArea !== null) {
            this.getPower(powerupInArea, map);
        } else if (nearestPlayer !== null) {
            // console.log(this.id, " follows by", nearestPlayer.id);
            this.cleverWander(nearestPlayer, map);
        }
    }


    isBehindWall(player, map) {
        let destX = player.posX;
        let destY = player.posY;
        let angle = this.getAngle(destX, destY);
        let intervals = 10;
        // let step = this.countDistToObject(player)/intervals;
        let dx = destX - this.posX;
        let dy = destY - this.posY;
        for (let steps = 0; steps < intervals; steps++) {
            let xFactor = destX * Math.cos(angle) / (intervals - steps);
            let yFactor = destY * Math.sin(angle) / (intervals - steps);
            let testX = this.posX + xFactor;
            let testY = this.posY + yFactor;
            console.log("Own coords X:", this.posX, "Y:", this.posY);
            console.log("Missle coords X:", xFactor, "Y:", yFactor);

            console.log("Step:", steps, "Test coords X:", testX, "Y:", testY);
            let cell = map.getCellByPoint(testX, testY);
            if (cell && cell.isBlock) {
                console.log("Behind the wall on step", steps, "coords X:", testX, "Y:", testY);
                return true;
            }
        }
        return false;
    }

    getPower(powerupInArea, map) {
        this.cleverWanderPower(powerupInArea, map);
    }

    getAngle(destX, destY) {
        let angle = Math.atan((destY - this.posY) / (destX - this.posX));
        if ((destY - this.posY) < 0 && (destX - this.posX) < 0) {
            angle += 2 * Math.acos(0)
        }
        if ((destY - this.posY) > 0 && (destX - this.posX) < 0) {
            angle += 2 * Math.acos(0)
        }
        console.log(angle);
        return angle;
    }
}

function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1)
    rand = Math.round(rand);
    return rand;
}

module.exports = Player;