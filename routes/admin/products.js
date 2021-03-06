// import express
const express = require("express");
const multer = require("multer");

const { handleErrors, requireAuth } = require("./middlewares");
const productsRepo = require("../../repositories/products");
const productsNewTemplate = require("../../views/admin/products/new");
const productsIndexTemplate = require("../../views/admin/products/index");
const productsEditTemplate = require("../../views/admin/products/edit");
const { requireTitle, requirePrice } = require("./validators");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

///1 list products
router.get("/admin/products", requireAuth, async (req, res) => {
  //user is making request to admin/products repo
  //   res is response to browser

  const products = await productsRepo.getAll();
  res.send(productsIndexTemplate({ products: products }));
});
///2 show form to create product
router.get("/admin/products/new", requireAuth, (req, res) => {
  res.send(productsNewTemplate({}));
});
///3 submit create product form
router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productsNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString("base64");
    const { title, price } = req.body;
    await productsRepo.create({ title, price, image });
    res.redirect("/admin/products");
  }
);
///4 show edit product route
// the id of the product in the URL needs to be encoded
router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  // console.log(req.params.id);
  // get product values from the repo
  const product = await productsRepo.getOne(req.params.id);
  if (!product) {
    return res.send("Product not found ");
  }
  res.send(productsEditTemplate({ product }));
});
/// 5 submit edited product
router.post(
  "/admin/products/:id/edit",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productsEditTemplate, async req => {
    const product = await productsRepo.getOne(req.params.id);
    return { product };
  }),
  async (req, res) => {
    //take changes passed and apply to product in the repo
    const changes = req.body;
    if (req.file) {
      changes.image = req.file.buffer.toString("base64");
    }
    try {
      await productsRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send("could not find item");
    }
    res.redirect("/admin/products");
  }
);
/// 6 delete product
router.post("/admin/products/:id/delete", requireAuth, async (req, res) => {
  await productsRepo.delete(req.params.id);
  res.redirect("/admin/products");
});
// export the module
module.exports = router;
// go to index.js and import this router
