function cleanString(str) {
    // Xóa tất cả các dấu câu
    let cleanedStr = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"]/g, ' ');
    // Chuyển đổi chữ thành chữ thường
    cleanedStr = cleanedStr.toLowerCase().trim();
    return cleanedStr;
}

function intersection(arrays) {
    if (arrays.length === 0) return [];
    return arrays.reduce((acc, array) => acc.filter(value => array.includes(value)));
}

class TrieNode {
    constructor() {
        this.children = {};
        this.sentences = {};
    }
}

class TrieTree {
    constructor() {
        this.root = new TrieNode();
    }

    insert(sentence, transaction) {
        const words = cleanString(sentence).split(' ').filter(word => word.length > 0);
        /*for (let i = 0; i < words.length; i++) {
            let node = this.root;
            for (let j = i; j < words.length; j++) {
                const word = words[j];
                if (!node.children[word]) {
                    node.children[word] = new TrieNode();
                }
                node = node.children[word];
                node.sentences.push(transaction);
            }
        }*/

        let node = this.root;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (!this.root.children[word]) {
                this.root.children[word] = new TrieNode();

            } 
            let temp_node = this.root.children[word];
            
            if (temp_node.sentences[transaction] !== undefined) {
                //temp_node.sentences[transaction] = [i];
                //console.log(temp_node.sentences[transaction]);
                temp_node.sentences[transaction].push(i);
            } else {
                //temp_node.sentences[transaction].append(i);
                temp_node.sentences[transaction] = [i];
            }
            //console.log(temp_node.sentences);        

            if (!node.children[word]) {
                node.children[word] = temp_node;
            }
            node = temp_node;
        }
    }

    search(substring) {
        const words = cleanString(substring).split(' ').filter(word => word.length > 0);
        let node = this.root;
        let res = null;
        for (const word of words) {
            //console.log(word);
            let old_node = node;
            if (!node.children[word]) {
                return [];
            }
            node = node.children[word];
            if (res === null) {
                //console.log("Nullllll");

                res = Object.keys(node.sentences);
                //console.log(res);
            }
            else {
                //console.log("Not Nullllll");
                let new_res = [];
                for (const sentence of res) {
                    //console.log(sentence, res);
                    if (node.sentences[sentence] === undefined) continue;
                    let approve = false;
                    for (const i of old_node.sentences[sentence]) {

                        if (node.sentences[sentence].includes(i + 1)) {
                            approve = true;
                            
                            break;
                        }
                        
                        //console.log(old_node.sentences[sentence]);
                        //console.log(node.sentences[sentence]);

                    }
                    if (approve) {
                        new_res.push(sentence);

                    }
                    //console.log("New res: ", new_res);

                }
                res = new_res;
            }
        }
        //return node.sentences;
        return res;
    }
}

module.exports = TrieTree;