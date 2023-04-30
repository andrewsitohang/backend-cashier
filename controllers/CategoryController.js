import category from '../models/Category.js';

const index = async (req, res) => {
    try {
        const categories = await category.find( {status: 'active'} );
        if (!categories) {throw {code: 500, message: 'index category failed'}};

        return res.status(200).json({
            status: true,
            total: categories.length,
            categories
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message || 'index category failed'
        });
    }
}

const store = async (req, res) => {
    try{
        if(!req.body.title) { throw { code: 428, message: "Title is required" }}

        const title = req.body.title;
        
        const newCategory = new category({ 
            title: title,
        });
        const Category = await newCategory.save();

        if (!Category) {throw {code: 500, message: 'Store category failed'}};
        
        return res.status(200).json({
            status: true,
            Category
        });       
    } catch (err) {
        return res.status(err.code).json({
            status: false,
            message: err.message
        });       
    }
}

export { index, store };