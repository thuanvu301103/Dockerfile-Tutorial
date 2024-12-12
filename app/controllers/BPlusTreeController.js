const BPlusTree = require('../models/BPlusTree');

const bPlusTree = new BPlusTree(4);

// Insert new element
exports.insert = async (req, res) => {
    const { key, value } = req.query;
    if (!key || !value) {
        return res.status(400).send('Key and value are required');
    }
    bPlusTree.insert(key, value);
    res.status(200).send('Element inserted successfully');
};

// Search value by key
exports.search = async (req, res) => {
    const { key } = req.query;
    var value = bPlusTree.search(key);
    res.status(200).json({value: value});
};