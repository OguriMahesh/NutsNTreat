// ══════════════════════════════════════════════════════════════
//  NutsNTreat – Product Seeder Route
//  Mount in your Express app:
//    const seedRouter = require('./seedProducts');
//    app.use('/api', seedRouter);
//
//  Then hit once:  POST http://localhost:5000/api/seed-products
//  Remove or disable this route after seeding!
// ══════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();

// ── Adjust this import to match your Product model path ──
const Product = require('./models/Product');

const ALL_PRODUCTS = [
  // ── DRY FRUITS ──
  { name:'California Almonds',    category:'Dry Fruits', price:349, originalPrice:399, weight:'250g', badge:'Best Seller', rating:4.9, stock:100, isActive:true,
    description:'Grade A almonds from California, roasted to perfection. Rich in Vitamin E & protein.',
    image:'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&q=80' },

  { name:'Medjool Dates',         category:'Dry Fruits', price:299, originalPrice:0,   weight:'200g', badge:'',            rating:4.7, stock:80,  isActive:true,
    description:'Jumbo Medjool dates — soft, caramel-rich and packed with natural energy.',
    image:'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=500&q=80' },

  { name:'Cashew W240',           category:'Dry Fruits', price:419, originalPrice:479, weight:'250g', badge:'Hot',         rating:4.8, stock:90,  isActive:true,
    description:'Whole Grade W240 cashews — extra creamy, buttery & large. Perfect for snacking.',
    image:'https://th.bing.com/th/id/R.2fddf3164744c9ec8d0fc8f57f56f2fb?rik=RId%2fQHJ2l6pJYw&riu=http%3a%2f%2fwww.askmeall.in%2fwp-content%2fuploads%2f2023%2f11%2fCashews.png&ehk=Qfd258%2bbu7WyezUkZ0kSgmf0t6cPDxtOm%2fWUIFd4yFA%3d&risl=&pid=ImgRaw&r=0' },

  { name:'Iranian Pistachios',    category:'Dry Fruits', price:529, originalPrice:0,   weight:'200g', badge:'',            rating:4.6, stock:60,  isActive:true,
    description:'Hand-picked Iranian pistachios, roasted & lightly salted in shell.',
    image:'https://iranforworld.com/wp-content/uploads/2024/11/iranian-pistachios-3.jpg' },

  { name:'Organic Walnuts',       category:'Dry Fruits', price:389, originalPrice:449, weight:'250g', badge:'New',         rating:4.8, stock:75,  isActive:true,
    description:'Shelled walnut halves — omega-3 rich, brain-boosting superfood.',
    image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80' },

  { name:'Golden Raisins',        category:'Dry Fruits', price:199, originalPrice:0,   weight:'300g', badge:'',            rating:4.5, stock:120, isActive:true,
    description:'Sun-dried golden raisins — naturally sweet with no added sugar.',
    image:'https://www.mashed.com/img/gallery/what-are-golden-raisins-and-what-do-they-taste-like/intro-1616084168.jpg' },

  { name:'Dried Apricots',        category:'Dry Fruits', price:289, originalPrice:329, weight:'200g', badge:'New',         rating:4.7, stock:85,  isActive:true,
    description:'Plump Turkish apricots, sun-dried & naturally sweet. High in iron & fibre.',
    image:'https://tse4.mm.bing.net/th/id/OIP.54Zvc_aYJewjU2h016vnQQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3' },

  { name:'Black Raisins',         category:'Dry Fruits', price:179, originalPrice:0,   weight:'300g', badge:'',            rating:4.4, stock:130, isActive:true,
    description:'Dark, juicy black raisins packed with antioxidants and natural sweetness.',
    image:'https://www.nutritionfact.in/wp-content/uploads/2023/07/Black-Resins.jpg' },

  { name:'Dried Cranberries',     category:'Dry Fruits', price:249, originalPrice:0,   weight:'200g', badge:'',            rating:4.6, stock:95,  isActive:true,
    description:'Tart & sweet dried cranberries — great for trail mixes and baking.',
    image:'https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=500&q=80' },

  { name:'Brazil Nuts',           category:'Dry Fruits', price:599, originalPrice:0,   weight:'150g', badge:'Exotic',      rating:4.7, stock:40,  isActive:true,
    description:'Selenium-packed Brazil nuts — just 1–2 a day meets your daily selenium needs.',
    image:'https://media.post.rvohealth.io/wp-content/uploads/2022/05/brazil-nuts-1296x728-body.jpg' },

  { name:'Macadamia Nuts',        category:'Dry Fruits', price:749, originalPrice:849, weight:'150g', badge:'Hot',         rating:4.8, stock:35,  isActive:true,
    description:'Buttery macadamia nuts — rich, indulgent and loaded with healthy fats.',
    image:'https://images.onlymyhealth.com/imported/images/2023/December/16_Dec_2023/main-macadamianutshealthbenefits.jpg' },

  { name:'Dried Figs',            category:'Dry Fruits', price:319, originalPrice:0,   weight:'200g', badge:'',            rating:4.5, stock:70,  isActive:true,
    description:'Naturally sweet Turkish figs — high in calcium, fibre and natural sugars.',
    image:'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&q=80' },

  // ── MIXES ──
  { name:'Classic Trail Mix',     category:'Mixes', price:279, originalPrice:319, weight:'200g', badge:'Best Seller', rating:4.9, stock:110, isActive:true,
    description:'Almonds, cashews, raisins & cranberries — the ultimate all-day trail mix.',
    image:'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=500&q=80' },

  { name:'Spicy Masala Mix',      category:'Mixes', price:249, originalPrice:0,   weight:'200g', badge:'Hot',         rating:4.7, stock:100, isActive:true,
    description:'Bold masala-spiced mixed nuts & seeds for the adventurous snacker.',
    image:'https://i.ytimg.com/vi/hzBqPWRkmko/maxresdefault.jpg' },

  { name:'Dark Choco Nut Mix',    category:'Mixes', price:319, originalPrice:0,   weight:'200g', badge:'',            rating:4.8, stock:80,  isActive:true,
    description:'Dark choco chips, almonds & hazelnuts — sinfully delicious & guilt-free.',
    image:'https://static.wixstatic.com/media/5e083f_43ac36c5909a4fd1830af0b81164d4ff~mv2.png/v1/fill/w_980,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/5e083f_43ac36c5909a4fd1830af0b81164d4ff~mv2.png' },

  { name:'Honey Roasted Mix',     category:'Mixes', price:289, originalPrice:329, weight:'200g', badge:'New',         rating:4.6, stock:90,  isActive:true,
    description:'Cashews, almonds & peanuts glazed in pure honey and sea salt.',
    image:'https://i.ytimg.com/vi/WIPgHAFmAa0/maxresdefault.jpg' },

  { name:'Tropical Fruit Mix',    category:'Mixes', price:259, originalPrice:0,   weight:'250g', badge:'',            rating:4.5, stock:75,  isActive:true,
    description:'Mango, pineapple, papaya & coconut chips — a holiday in every bite.',
    image:'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&q=80' },

  { name:'Mediterranean Mix',     category:'Mixes', price:349, originalPrice:399, weight:'200g', badge:'New',         rating:4.7, stock:60,  isActive:true,
    description:'Olives, sundried tomatoes, pine nuts & walnuts — a gourmet snack blend.',
    image:'https://copilot.microsoft.com/th/id/BCO.666f841b-45d0-4389-a09b-70bd4f03da72.png' },

  { name:'Protein Power Crunch',  category:'Mixes', price:299, originalPrice:0,   weight:'200g', badge:'Hot',         rating:4.8, stock:85,  isActive:true,
    description:'Roasted chickpeas, almonds, pumpkin seeds & edamame — pure protein.',
    image:'https://copilot.microsoft.com/th/id/BCO.e04797a2-942d-459a-ac16-b65ac6b949c2.png' },

  { name:'Himalayan Pink Mix',    category:'Mixes', price:329, originalPrice:0,   weight:'200g', badge:'',            rating:4.6, stock:70,  isActive:true,
    description:'Mixed nuts seasoned with Himalayan pink salt and herbs. Gourmet snacking.',
    image:'https://tiimg.tistatic.com/fp/1/009/299/mix-dry-fruits-363.jpg' },

  // ── KIDS ──
  { name:'Kids Fruity Combo',     category:'Kids', price:399, originalPrice:449, weight:'300g', badge:'Best Seller', rating:4.9, stock:100, isActive:true,
    description:'Raisins, apricots, cranberries & dates. School-tiffin perfect. No added sugar.',
    image:'https://copilot.microsoft.com/th/id/BCO.1de9bf5c-9138-4fd1-bacc-4585ec89d202.png' },

  { name:'Kids Choco Nuts',       category:'Kids', price:359, originalPrice:0,   weight:'250g', badge:'',            rating:4.8, stock:90,  isActive:true,
    description:'Mini cashews & almonds with dark choco drops. Kids absolutely love it!',
    image:'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&q=80' },

  { name:'Tiny Munchies Box',     category:'Kids', price:449, originalPrice:499, weight:'400g', badge:'Hot',         rating:4.7, stock:65,  isActive:true,
    description:'6 curated kid-approved snacks in a fun, colourful gift box.',
    image:'https://tse4.mm.bing.net/th/id/OIP.o203tYSzvTO4GdopPWJWFgHaFP?rs=1&pid=ImgDetMain&o=7&rm=3' },

  { name:'Rainbow Fruit Bites',   category:'Kids', price:299, originalPrice:0,   weight:'200g', badge:'New',         rating:4.8, stock:80,  isActive:true,
    description:'Colourful dried fruits — strawberry, mango, kiwi & blueberry. Kids adore it.',
    image:'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&q=80' },

  { name:'School Snack Pack',     category:'Kids', price:249, originalPrice:289, weight:'250g', badge:'',            rating:4.6, stock:110, isActive:true,
    description:'Portion-sized nut & fruit mix for school bags. 5 individual packs inside.',
    image:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80' },

  { name:'Nutty Buddy Bar',       category:'Kids', price:199, originalPrice:0,   weight:'180g', badge:'New',         rating:4.5, stock:95,  isActive:true,
    description:'No-bake nut & date bars sweetened naturally. Great after-school snack.',
    image:'https://i5.walmartimages.com/seo/Little-Debbie-Nutty-Buddy-Bars-12-ct_fb9b89fe-04f5-46ff-8d19-ceaf0efd64c5.3ff702c657b5967f9527bb03656d8a52.jpeg' },

  // ── ADULTS ──
  { name:'Adult Wellness Pack',   category:'Adults', price:599, originalPrice:679, weight:'350g', badge:'Best Seller', rating:4.9, stock:80,  isActive:true,
    description:'Walnuts, almonds, flaxseed & pumpkin seeds — your complete daily wellness ritual.',
    image:'https://copilot.microsoft.com/th/id/BCO.6ddc2ef4-3296-4f66-b33b-eef1a626e917.png' },

  { name:'Heart Health Mix',      category:'Adults', price:549, originalPrice:0,   weight:'300g', badge:'',            rating:4.8, stock:70,  isActive:true,
    description:'Omega-3 rich nuts and seeds formulated for cardiovascular wellness.',
    image:'https://copilot.microsoft.com/th/id/BCO.bbc5cb82-c2db-4daa-be3d-b9144c938f58.png' },

  { name:'Stress Relief Blend',   category:'Adults', price:479, originalPrice:529, weight:'300g', badge:'New',         rating:4.7, stock:65,  isActive:true,
    description:'Magnesium-rich cashews, pumpkin seeds & ashwagandha. Calm in every bite.',
    image:'https://krishival.com/cdn/shop/articles/Pumpkin_Seeds_and_Cashews__A_Healthy_Snack_for_Better_Digestion.jpg?v=1757582491&width=1200' },

  { name:'Immunity Booster Mix',  category:'Adults', price:519, originalPrice:0,   weight:'300g', badge:'Hot',         rating:4.8, stock:75,  isActive:true,
    description:'Amla, turmeric-coated almonds, ginger cashews & seeds. Daily immunity support.',
    image:'https://copilot.microsoft.com/th/id/BCO.cdf50b5a-2879-4ec9-8da8-81c8709f4b92.png' },

  { name:'Anti-Ageing Blend',     category:'Adults', price:629, originalPrice:699, weight:'250g', badge:'New',         rating:4.6, stock:50,  isActive:true,
    description:'Antioxidant-rich walnuts, Brazil nuts, goji berries & dark cacao nibs.',
    image:'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' },

  // ── GYM ──
  { name:'Gym Power Pack',        category:'Gym', price:649, originalPrice:729, weight:'400g', badge:'Best Seller', rating:4.9, stock:90,  isActive:true,
    description:'High-protein almonds, peanuts & soy nuts — ultimate fuel for muscle recovery.',
    image:'https://copilot.microsoft.com/th/id/BCO.c6aa2ce5-1b94-4a5e-8e3a-43e689cda0ab.png' },

  { name:'Pre-Workout Crunch',    category:'Gym', price:499, originalPrice:0,   weight:'350g', badge:'Hot',         rating:4.8, stock:80,  isActive:true,
    description:'Energy-dense dates, cashews & peanuts. Get the perfect fuel before your session.',
    image:'https://copilot.microsoft.com/th/id/BCO.7975fd92-600d-4f84-b2aa-121ccbc5510b.png' },

  { name:'Post-Workout Recovery', category:'Gym', price:579, originalPrice:649, weight:'400g', badge:'',            rating:4.7, stock:70,  isActive:true,
    description:'BCAA-supporting walnut, almond & pumpkin seed blend for post-gym recovery.',
    image:'https://copilot.microsoft.com/th/id/BCO.aa2f5017-b32e-459f-abdf-133528b4bb12.png' },

  { name:'Natural Nut Butter',    category:'Gym', price:429, originalPrice:479, weight:'300g', badge:'New',         rating:4.8, stock:60,  isActive:true,
    description:'Almond-peanut butter blend — zero added sugar, zero palm oil, pure goodness.',
    image:'https://copilot.microsoft.com/th/id/BCO.7da88f77-c4f5-47e2-9bb2-5bb185f9e377.png' },

  { name:'Lean Muscle Mix',       category:'Gym', price:549, originalPrice:0,   weight:'350g', badge:'Hot',         rating:4.8, stock:75,  isActive:true,
    description:'Soy nuts, hemp seeds, pumpkin seeds & roasted chickpeas. High protein, low fat.',
    image:'https://copilot.microsoft.com/th/id/BCO.ad8db2b4-bf1a-40c0-a138-52c83021e61f.png' },

  { name:'Endurance Blend',       category:'Gym', price:499, originalPrice:559, weight:'350g', badge:'',            rating:4.6, stock:65,  isActive:true,
    description:'Complex carb-rich dates, banana chips & almonds for long endurance sessions.',
    image:'https://copilot.microsoft.com/th/id/BCO.c0becfbc-bcd0-432a-8298-d7e708b7f0dd.png' },

  // ── SEEDS ──
  { name:'Superfood Seed Mix',    category:'Seeds', price:229, originalPrice:269, weight:'200g', badge:'Best Seller', rating:4.8, stock:100, isActive:true,
    description:'Pumpkin, sunflower & flaxseeds — a daily superfood powerhouse.',
    image:'https://copilot.microsoft.com/th/id/BCO.b461e239-cca6-4a5f-aec7-3cb5e8d2ab7b.png' },

  { name:'Chia Seeds',            category:'Seeds', price:199, originalPrice:0,   weight:'250g', badge:'',            rating:4.7, stock:110, isActive:true,
    description:'Organic chia seeds — loaded with omega-3, fibre and protein.',
    image:'https://copilot.microsoft.com/th/id/BCO.b5324518-603a-4a5e-98fb-54a260f7ac9d.png' },

  { name:'Hemp Seeds',            category:'Seeds', price:349, originalPrice:399, weight:'200g', badge:'New',         rating:4.7, stock:70,  isActive:true,
    description:'Hulled hemp seeds — complete plant protein with all 9 essential amino acids.',
    image:'https://tse3.mm.bing.net/th/id/OIP.JieHU7bGbl4XLSKDp0aO2AHaE6?rs=1&pid=ImgDetMain&o=7&rm=3' },

  { name:'Sesame Seeds',          category:'Seeds', price:149, originalPrice:0,   weight:'300g', badge:'',            rating:4.4, stock:130, isActive:true,
    description:'Toasted sesame seeds — rich in calcium, zinc and healthy fats.',
    image:'https://tse3.mm.bing.net/th/id/OIP.HCnw-o67Syo0-tiIV6lxngHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },

  // ── EXOTIC ──
  { name:'Saffron Almonds',       category:'Exotic', price:699, originalPrice:799, weight:'200g', badge:'Exotic', rating:4.9, stock:30,  isActive:true,
    description:'Premium almonds infused with pure Kashmiri saffron. A luxurious snack.',
    image:'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&q=80' },

  { name:'Rose Pistachio Mix',    category:'Exotic', price:649, originalPrice:0,   weight:'200g', badge:'New',    rating:4.8, stock:25,  isActive:true,
    description:'Iranian pistachios tossed with dried rose petals and cardamom. Persian style.',
    image:'https://tse1.explicit.bing.net/th/id/OIP.P_vum2l-39XFg7DxvAFShQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3' },

  { name:'Truffle Cashews',       category:'Exotic', price:749, originalPrice:849, weight:'150g', badge:'Hot',    rating:4.8, stock:20,  isActive:true,
    description:'Premium cashews infused with black truffle oil and sea salt. Gourmet indulgence.',
    image:'https://tse3.mm.bing.net/th/id/OIP.bQEZCcLWInUail5_cSDamQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
];

// ── SEED ROUTE ──
// POST /api/seed-products
// Optional query param: ?clear=true  →  deletes all existing products first
router.post('/seed-products', async (req, res) => {
  try {
    const clearFirst = req.query.clear === 'true';

    if (clearFirst) {
      await Product.deleteMany({});
      console.log('[Seeder] Cleared existing products.');
    }

    // Skip products that already exist (match by name) to avoid duplicates
    const existing = await Product.find({}, 'name').lean();
    const existingNames = new Set(existing.map(p => p.name));

    const toInsert = ALL_PRODUCTS.filter(p => !existingNames.has(p.name));

    if (toInsert.length === 0) {
      return res.json({
        success: true,
        message: 'All products already exist in the database. Nothing inserted.',
        inserted: 0,
        skipped: ALL_PRODUCTS.length,
      });
    }

    const inserted = await Product.insertMany(toInsert);

    console.log(`[Seeder] Inserted ${inserted.length} products.`);
    res.json({
      success: true,
      message: `Seeded ${inserted.length} products successfully!`,
      inserted: inserted.length,
      skipped: ALL_PRODUCTS.length - toInsert.length,
      products: inserted.map(p => ({ id: p._id, name: p.name, category: p.category })),
    });

  } catch (err) {
    console.error('[Seeder] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;