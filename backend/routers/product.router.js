const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const upload = require("../services/file.service");
const response = require("../services/response.service");

router.post("/add", upload.array("images"), async (req, res) => {
  response(res, async () => {
    const { name, stock, price, categories } = req.body;

    const productId = uuidv4();
    let product = new Product({
      _id: productId,
      name: name.toUpperCase(),
      stock: stock,
      price: price,
      categories: categories,
      isActive: true,
      imageUrls: req.files,
      createdDate: new Date(),
    });
    await product.save();

    res.json({ message: "Ürün kaydı başarıyla tamamlandı" });
  });
});

router.post("/removeById", async (req, res) => {
  response(res, async () => {
    const { _id } = req.body;

    const product = await Product.findById(_id);
    for (const image of product.imageUrls) {
      fs.unlink(image.path, () => {});
    }

    await Product.findByIdAndDelete(_id);
    res.json({ message: "Ürün kaydı silindi" });
  });
});

router.post("/", async (req, res) => {
  response(res, async () => {
    const { pageNumber, pageSize, search } = req.body;

    const searchQuery = {
      name: { $regex: search, $options: "i" }
    };

    let productCount = await Product.countDocuments(searchQuery);

    let products = await Product.find(searchQuery)
      .sort({ name: 1 })
      .populate("categories")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    let totalPageCount = Math.ceil(productCount / pageSize);
    let model = {
      datas: products,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalPageCount: totalPageCount,
      isFirstPage: pageNumber == 1 ? true : false,
      isLastPage: totalPageCount == pageNumber ? true : false,
    };

    res.json(model);
  });
});

router.post("/changeActiveStatus", async(req, res) => {
  response(res, async() => {
    const {_id} = req.body;
    let product = await Product.findById(_id);
    product.isActive = !product.isActive;
    await Product.findByIdAndUpdate(_id, { isActive: product.isActive }, { new: true });
    res.json({message: "Ürünün durumu değiştirildi", isActive: product.isActive});
  })
})

router.post("/getById", async (req, res) => {
  response(res, async () => {
      const { _id } = req.body; 
      let product = await Product.findById(_id); 
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.json(product); 
  });
});

router.post("/update", upload.array("images"), async(req, res) => {
    response(res, async() => {
        const {_id, name, stock, price, categories} = req.body;

        let product = await Product.findById(_id);

        if (!product) {
          return res.status(404).json({ message: "Ürün bulunamadı" });
        }

        let imageUrls = [...product.imageUrls, ...req.files];

        await Product.findByIdAndUpdate(_id, {
          $set: {
              name: name.toUpperCase(),
              stock,
              price,
              imageUrls,
              categories
          }
      });
       
        res.json({message: "Ürün kaydı güncellendi"});
    });
});

router.post("/removeImageByProductAndIndex", async(req, res) => {
    response(res, async() => {
        const {_id, index} = req.body;

        let product = await Product.findById(_id);
        if(product.imageUrls.length == 1){
            res.status(500).json({message: "Ürünün son resmini silemezsiniz. En az 1 ürün resmi bulunmak zorundadır"});
        }
        else{
            let image = product.imageUrls[index];
            product.imageUrls.splice(index, 1);
            await Product.findByIdAndUpdate(_id, product);
            fs.unlink(image.path, () => {});
            res.json({message: "Resim kaldırıldı"});
        }
    });
});

module.exports = router;