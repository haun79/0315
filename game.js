/**
 * 犯罪現場推理遊戲 - 核心邏輯
 * 包含：隨機案件生成器、對話引擎、遊戲狀態管理
 */

class CaseGenerator {
    constructor() {
        this.roles = ["管家", "廚師", "女僕", "司機", "警衛", "園丁"];
        this.locations = ["書房", "廚房", "客廳", "花園", "車庫", "地下室"];
        this.weapons = ["刀", "繩子", "毒藥", "鐵棒", "火槍", "花瓶"];
    }

    /**
     * 生成隨機案件
     * @returns {Object} 案件數據
     */
    generate(level) {
        // 隨機選出 3-6 名嫌疑人
        const suspectCount = Math.floor(Math.random() * 4) + 3; 
        const selectedRoles = this._shuffle([...this.roles]).slice(0, suspectCount);
        
        // 隨機選出一個兇手
        const killerIndex = Math.floor(Math.random() * suspectCount);
        const killerRole = selectedRoles[killerIndex];

        // 隨機選出案發地點與武器
        const crimeLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
        const crimeWeapon = this.weapons[Math.floor(Math.random() * this.weapons.length)];

        // 分配嫌疑人位置與線索
        const suspects = selectedRoles.map((role, index) => {
            const isKiller = index === killerIndex;
            let currentLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
            
            // 嫌疑人目擊線索
            let witnessInfo = null;
            let weaponHint = null;

            if (!isKiller) {
                const rand = Math.random();
                if (rand < 0.4) {
                    // 目擊到人
                    const randomSuspect = selectedRoles[Math.floor(Math.random() * suspectCount)];
                    if (randomSuspect !== role) {
                        witnessInfo = `我看見 ${randomSuspect} 進去了 ${this.locations[Math.floor(Math.random() * this.locations.length)]}`;
                    }
                } else if (rand < 0.7) {
                    // 聽到聲音
                    witnessInfo = `我好像聽到 ${this.locations[Math.floor(Math.random() * this.locations.length)]} 有聲音`;
                }
                
                // 關於武器的線索
                if (Math.random() < 0.5) {
                    weaponHint = `我在 ${this.locations[Math.floor(Math.random() * this.locations.length)]} 看到了一把可疑的 ${crimeWeapon}。`;
                }
            }

            return {
                id: index,
                name: role,
                isKiller: isKiller,
                location: currentLocation,
                witness: witnessInfo,
                weaponHint: weaponHint,
                personality: isKiller ? "閃爍其詞" : "冷靜"
            };
        });

        return {
            level: level,
            killer: killerRole,
            location: crimeLocation,
            weapon: crimeWeapon,
            suspects: suspects
        };
    }

    _shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }
}

class GameEngine {
    constructor() {
        this.generator = new CaseGenerator();
        this.currentCase = null;
        this.currentLevel = 1;
        this.logs = [];
    }

    startNewGame() {
        this.currentCase = this.generator.generate(this.currentLevel);
        this.logs = [`案件第 ${this.currentLevel} 關開始。一位莊園主被殺害了，找出兇手、地點與武器。`];
        return this.currentCase;
    }

    /**
     * 處理問話邏輯
     * @param {string} roleName 
     * @param {string} questionType 
     */
    askQuestion(roleName, questionType) {
        const suspect = this.currentCase.suspects.find(s => s.name === roleName);
        if (!suspect) return "找不到該嫌疑人。";

        let answer = "";

        switch (questionType) {
            case "WHERE": // 你當時在哪？
                answer = `我那時候在 ${suspect.location} 休息。`;
                break;
            case "WITNESS": // 你看到什麼嗎？
                if (suspect.isKiller) {
                    answer = "我...我什麼都沒看到，我一直在睡覺。";
                } else {
                    answer = suspect.witness || "我不太清楚，當時沒注意到。";
                }
                break;
            case "WEAPON": // 你有看到可疑物品嗎？
                if (suspect.isKiller) {
                    answer = "沒...沒有，我沒看到什麼危險的東西。";
                } else {
                    answer = suspect.weaponHint || "我沒看到什麼特別的物品。";
                }
                break;
            case "ACCUSE": // 你是兇手嗎？
                answer = suspect.isKiller ? "你在說什麼？我才不是兇手！" : "你瘋了嗎？我怎麼可能會做這種事。";
                break;
            default:
                answer = "我不太清楚你在說什麼。";
        }

        const logEntry = { speaker: roleName, text: answer };
        this.logs.push(`${roleName}: ${answer}`);
        return answer;
    }

    /**
     * 指認兇手
     */
    solve(suspectName, locationName, weaponName) {
        const isCorrect = 
            suspectName === this.currentCase.killer &&
            locationName === this.currentCase.location &&
            weaponName === this.currentCase.weapon;

        if (isCorrect) {
            this.currentLevel++;
            return { success: true, message: "恭喜！你成功破解了案件！" };
        } else {
            return { success: false, message: "推理有誤，兇手還逍遙法外..." };
        }
    }
}

// 輸出到 window 供 HTML 使用
window.game = new GameEngine();
