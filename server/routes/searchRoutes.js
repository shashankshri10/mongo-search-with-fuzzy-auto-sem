const express = require("express");
const router = express.Router();
const searchFuncs = require("../controllers/search");

router.get("/search-fuzzy", searchFuncs.searchFuzzy);
router.get("/search-autocomplete", searchFuncs.searchAutocomplete);
router.get("/search-semantic", searchFuncs.searchSemantic);

module.exports = router;