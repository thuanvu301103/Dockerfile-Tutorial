function isEqual(value1, value2) {

    // Check if both values are Date objects
    if (value1 instanceof Date && value2 instanceof Date) {
        return value1.getTime() === value2.getTime();
    }

    // Check if both values are numbers
    if (typeof value1 === 'number' && typeof value2 === 'number') {
        return value1 === value2;
    }

    // Check if both values are strings
    if (typeof value1 === 'string' && typeof value2 === 'string') {
        return value1 === value2;
    }

    // If types are different or not handled, return false
    return false;
}

class AVLNode {
    constructor(key, value) {
        this.key = key;
        this.values = [value]; // Support multiple values for the same key
        this.height = 1;
        this.left = null;
        this.right = null;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    // Helper to get height of a node
    getHeight(node) {
        return node ? node.height : 0;
    }

    // Helper to get balance factor
    getBalanceFactor(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    // Rotate Right
    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x; // New root
    }

    // Rotate Left
    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y; // New root
    }

    // Insert key-value pair into the AVL Tree using iteration
    insert(key, value) {
        let node = new AVLNode(key, value);
        if (!this.root) {
            this.root = node;
            return;
        }

        let current = this.root;
        let stack = [];

        while (true) {
            stack.push(current);

            if (key < current.key) {
                if (!current.left) {
                    current.left = node;
                    break;
                }
                current = current.left;
            } else if (key > current.key) {
                if (!current.right) {
                    current.right = node;
                    break;
                }
                current = current.right;
            } else {
                // If the key already exists, add the value to the values array
                current.values.push(value);
                return;
            }
        }

        // Update heights and balance the tree
        while (stack.length > 0) {
            let parent = stack.pop();
            parent.height = Math.max(this.getHeight(parent.left), this.getHeight(parent.right)) + 1;

            let balance = this.getBalanceFactor(parent);

            // Rotate if unbalanced
            if (balance > 1 && key < parent.left.key) {
                if (stack.length > 0) {
                    let grandparent = stack[stack.length - 1];
                    if (grandparent.left === parent) {
                        grandparent.left = this.rotateRight(parent);
                    } else {
                        grandparent.right = this.rotateRight(parent);
                    }
                } else {
                    this.root = this.rotateRight(parent);
                }
            } else if (balance < -1 && key > parent.right.key) {
                if (stack.length > 0) {
                    let grandparent = stack[stack.length - 1];
                    if (grandparent.left === parent) {
                        grandparent.left = this.rotateLeft(parent);
                    } else {
                        grandparent.right = this.rotateLeft(parent);
                    }
                } else {
                    this.root = this.rotateLeft(parent);
                }
            } else if (balance > 1 && key > parent.left.key) {
                parent.left = this.rotateLeft(parent.left);
                if (stack.length > 0) {
                    let grandparent = stack[stack.length - 1];
                    if (grandparent.left === parent) {
                        grandparent.left = this.rotateRight(parent);
                    } else {
                        grandparent.right = this.rotateRight(parent);
                    }
                } else {
                    this.root = this.rotateRight(parent);
                }
            } else if (balance < -1 && key < parent.right.key) {
                parent.right = this.rotateRight(parent.right);
                if (stack.length > 0) {
                    let grandparent = stack[stack.length - 1];
                    if (grandparent.left === parent) {
                        grandparent.left = this.rotateLeft(parent);
                    } else {
                        grandparent.right = this.rotateLeft(parent);
                    }
                } else {
                    this.root = this.rotateLeft(parent);
                }
            }
        }
    }

    // Public method to insert a key-value pair
    insertKeyValue(key, value) {
        this.insert(key, value);
    }

    // Search for a key and return its values
    search(root, key) {
        if (!root) return [];
        if (isEqual(key, root.key)) return root.values;
        if (key < root.key) return this.search(root.left, key);
        return this.search(root.right, key);
    }

    // Public search method
    searchKey(key) {
        return this.search(this.root, key);
    }

    // Range search: Find all values in the range [minKey, maxKey]
    rangeSearch(root, minKey, maxKey) {
        let result = [];
        let stack = [];
        let current = root;

        while (stack.length > 0 || current !== null) {
            // Traverse left subtree if there's a chance of smaller keys in range
            while (current !== null) {
                stack.push(current);
                current = current.left;
            }

            current = stack.pop();

            // Add node values if the key is within range
            if ((minKey < current.key || isEqual(minKey, current.key)) && (current.key < maxKey || isEqual(maxKey, current.key))) {
                //console.log(current.key);
                //console.log(current.values)
                result = result.concat(current.values);
            }

            // Traverse right subtree if there's a chance of larger keys in range
            if (current.key < maxKey) {
                current = current.right;
            } else {
                current = null;
            }
        }

        return result;
    }

    // Public range search method
    rangeSearchKeys(minKey, maxKey) {
        return this.rangeSearch(this.root, minKey, maxKey);
    }
}

module.exports = AVLTree;
