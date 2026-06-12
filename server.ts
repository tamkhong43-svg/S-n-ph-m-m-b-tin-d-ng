import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to products.json database file
const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");

// Ensure data directory and default seed products exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    url: "https://shopee.vn/Loa-Bluetooth-Retro-Go-Walnut-Premium-i.9999.1111",
    title: "Loa Bluetooth Retro Gỗ Walnut - Sudio Nômade",
    price: 1250000,
    image: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80",
    category: "Đồ điện tử",
    description: "Được chế tác tinh xảo từ chất liệu gỗ óc chó tự nhiên, Sudio Nômade mang lại sự kết hợp hoàn hảo giữa thiết kế cổ điển châu Âu và công nghệ âm thanh vòm hiện đại. Thời lượng pin lên tới 12 giờ phát liên tục, màng loa bass thụ động sâu lắng.",
    features: [
      "Vỏ gỗ óc chó Walnut tự nhiên 100%",
      "Kết nối Bluetooth 5.2 kết nối nhanh chóng",
      "Thời lượng pin ấn tượng lên đến 12 giờ",
      "Màng cộng hưởng trầm sâu độc quyền"
    ],
    rating: 4.9,
    reviewCount: 228,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    url: "https://shopee.vn/Nen-Thom-Sap-Dau-Nanh-Scented-Candle-Amber-i.9999.2222",
    title: "Nến Thơm Sáp Đậu Nành Amber & Moss - Premium",
    price: 420000,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80",
    category: "Phòng khách",
    description: "Được đổ tay thủ công từ sáp đậu nành thiên nhiên lành tính và tinh dầu tự nhiên nhập khẩu từ Pháp. Nốt hương Amber & Moss mang cảm giác ấm cỏ rêu ẩm ướt, không khí buổi sớm mát lành sâu trong rừng thông ẩm mát.",
    features: [
      "100% Sáp đậu nành tự nhiên nguyên chất",
      "Tinh dầu tự nhiên tinh khiết nhập khẩu Pháp",
      "Thời gian đốt sạch không khói 50 giờ",
      "Hũ hổ phách dày cao cấp bảo vệ mùi hương"
    ],
    rating: 4.8,
    reviewCount: 154,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    url: "https://shopee.vn/Binh-Giu-Nhiet-Matte-Black-Satin-Minimalist-i.9999.3333",
    title: "Bình Giữ Nhiệt Matte Black Satin - Minimalist Bottle",
    price: 580000,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    category: "Đồ gia dụng",
    description: "Chiếc bình giữ nhiệt mang ngôn ngữ thiết kế tối giản tối đa với lớp sơn tĩnh điện màu đen mờ (matte black satin) chống bám tay. Lõi thép không gỉ 316 y tế cao cấp, giữ nhiệt nóng và lạnh hoàn hảo suốt 24 giờ liên tục.",
    features: [
      "Lõi thép không gỉ SUS 316 y tế cao cấp",
      "Công nghệ cách nhiệt chân không 3 lớp",
      "Sơn tĩnh điện nhám cao cấp chống bám vân tay",
      "Nắp silicon kín khít tuyệt đối chống rò rỉ"
    ],
    rating: 5.0,
    reviewCount: 82,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    url: "https://shopee.vn/Ao-Khoac-Blazer-Nam-Han-Quoc-Linen-Khaki-i.9999.4444",
    title: "Áo Blazer Nam Linen Khaki - Atelier d'Homme",
    price: 850000,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
    category: "Thời trang",
    description: "Chiếc áo Blazer cao cấp may đo thủ công từ sợi thô Linen nhập khẩu, tạo cảm giác thoáng mát nhẹ tênh vào mùa hè mà vẫn giữ phom dáng thanh lịch tuyệt đối. Gam màu Khaki trung tính trang nhã dễ dàng phối đồ hằng ngày.",
    features: [
      "Sợi Linen thô cao cấp thoáng khí tự nhiên",
      "Lót vai cấu trúc mềm chuẩn phong cách Ý",
      "Phom suông Relaxed-fit hiện đại phù hợp mọi dáng người",
      "Khuy sừng tự nhiên nguyên khối tinh tế"
    ],
    rating: 4.7,
    reviewCount: 310,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    url: "https://shopee.vn/Nuoc-Hoa-Unisex-Sandalwood-Bergamot-Maison-i.9999.5555",
    title: "Nước Hoa Unisex Sandalwood & Bergamot - Maison",
    price: 1850000,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
    category: "Mỹ phẩm",
    description: "Sự kết hợp đầy say đắm giữa nốt hương gỗ đàn hương ấm áp cổ điển và sự tươi mát từ cam Bergamot Ý đầy sảng khoái. Tạo nên sự quyến rũ trung tính, thầm lặng nhưng bộc lộ phong thái lịch thiệp, quý phái thượng lưu.",
    features: [
      "Nhóm hương Gỗ Đàn Hương và Cam Citrus tươi mát",
      "Độ lưu hương bền bỉ lâu dài từ 8-10 giờ",
      "Thiết kế chai thủy tinh tối giản tinh tế",
      "Phù hợp cho cả nam và nữ (Unisex)"
    ],
    rating: 4.9,
    reviewCount: 96,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    url: "https://shopee.vn/So-Tay-Da-That-Khau-Tay-Heritage-Leather-i.9999.6666",
    title: "Sổ Tay Da Thật Khâu Tay Cổ Điển - Heritage Artisan",
    price: 350000,
    image: "https://images.unsplash.com/photo-1531346878377-a5ec20888e57?w=800&auto=format&fit=crop&q=80",
    category: "Khác",
    description: "Tác phẩm thủ công đích thực sở hữu bìa da bò thật nguyên tấm sáp sần, khâu thủ công bằng chỉ sáp siêu bền bỉ. Chất giấy viết kem ngà dày dặn 100gsm không lem nhòe khi viết mực bút máy, gìn giữ mọi ý tưởng của bạn lâu phai.",
    features: [
      "Da bò thật nguyên tấm chất lượng cao",
      "Khâu tay hoàn toàn thủ công nghệ thuật",
      "Giấy mỹ thuật chống lóa mắt 100gsm cao cấp",
      "Sở hữu dây kẹp trang trí thắt nút tiện lợi"
    ],
    rating: 4.9,
    reviewCount: 112,
    createdAt: new Date().toISOString()
  }
];

if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), "utf-8");
}

const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Thời trang", icon: "ShoppingBag" },
  { id: "cat-2", name: "Đồ điện tử", icon: "Smartphone" },
  { id: "cat-3", name: "Mỹ phẩm", icon: "Sparkles" },
  { id: "cat-4", name: "Phòng khách", icon: "Home" },
  { id: "cat-5", name: "Đồ gia dụng", icon: "Coffee" },
  { id: "cat-6", name: "Khác", icon: "Layers" }
];

if (!fs.existsSync(CATEGORIES_FILE)) {
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2), "utf-8");
}

function readCategoriesData() {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) return DEFAULT_CATEGORIES;
    const data = fs.readFileSync(CATEGORIES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading categories file:", err);
    return DEFAULT_CATEGORIES;
  }
}

function writeCategoriesData(cats: any) {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(cats, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing categories file:", err);
    return false;
  }
}

// Read products data from JSON
function readProductsData() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return DEFAULT_PRODUCTS;
    const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading file:", err);
    return DEFAULT_PRODUCTS;
  }
}

// Write products data to JSON
function writeProductsData(products: any) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing file:", err);
    return false;
  }
}

// Products API Routes
app.get("/api/products", (req, res) => {
  const products = readProductsData();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const products = readProductsData();
  const newProduct = {
    ...req.body,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  products.unshift(newProduct); // prepend so it appears at front
  writeProductsData(products);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const products = readProductsData();
  const index = products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    writeProductsData(products);
    res.json(products[index]);
  } else {
    res.status(404).json({ error: "Sản phẩm không tồn tại" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  let products = readProductsData();
  const previousLength = products.length;
  products = products.filter((p: any) => p.id !== id);
  if (products.length < previousLength) {
    writeProductsData(products);
    res.json({ success: true, message: `Đã xóa sản phẩm ${id}` });
  } else {
    res.status(404).json({ error: "Sản phẩm không tồn tại" });
  }
});

// Categories API Routes
app.get("/api/categories", (req, res) => {
  const categories = readCategoriesData();
  res.json(categories);
});

app.post("/api/categories", (req, res) => {
  const categories = readCategoriesData();
  const newCategory = {
    ...req.body,
    id: `cat-${Date.now()}`
  };
  categories.push(newCategory);
  writeCategoriesData(categories);
  res.status(201).json(newCategory);
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  let categories = readCategoriesData();
  categories = categories.filter((c: any) => c.id !== id && c.name !== id);
  writeCategoriesData(categories);
  res.json({ success: true, message: `Đã xóa danh mục ${id}` });
});

// AI Shopee extraction route
app.post("/api/extract-shopee", async (req, res) => {
  const { url, userHint } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Thiếu đường dẫn Shopee" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // If no API key configured, we provide an ultra-clean, smart mock generator for smooth testing!
    console.log("No Gemini API Key found. Returning elegantly inferred mock data.");
    const simulatedResponse = simulateShopeeExtraction(url, userHint);
    return res.json(simulatedResponse);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // We build the structured instruction for Gemini
    const prompt = `Bạn là một trợ lý AI thông minh phân tích sản phẩm cao cấp cho website bán hàng/sổ tay mua sắm tinh tế (phong cách tối giản, sang trọng).
Người dùng đã cung cấp một đường dẫn bán hàng của Shopee: "${url}"
Gợi ý bổ sung của người dùng (nếu có): "${userHint || 'Không có'}"

Hãy thực hiện nghiên cứu/đăng nhập Google Search (nếu cần) hoặc phân tích các từ khóa từ URL để giải mã thương hiệu và tên sản phẩm thực tế.
Vui lòng phân phối thông tin sản phẩm và trả về đúng định dạng JSON cao cấp sau:
- title: Tên sản phẩm sang trọng tinh túy (không chứa các kí tự rác của đại lý như "GIÁ SỈ", "SALE OFF", mã giảm giá, v.v., làm sạch tên sản phẩm tinh tế, ví dụ: "Áo Blazer Nam Thô Linen - Atelier").
- price: Giá trị bằng số tính theo tiền Việt (VND). Ước lượng hoặc lấy giá trị thực tế hợp lý. Ví dụ: 550000.
- category: Phân loại hợp lý nhất và ngắn gọn. Phải thuộc một trong nhóm: "Thời trang", "Đồ điện tử", "Mỹ phẩm", "Phòng khách", "Đồ gia dụng", hoặc "Khác".
- description: Một đoạn văn mô tả đầy nghệ thuật, cuốn hút và tinh tế nhất về sản phẩm (bằng tiếng Việt, dài khoảng 3-4 câu, tập trung vào trải nghiệm nghệ thuật, sự bền bỉ, phong cách thiết kế tối giản sang trọng).
- features: Một mảng các gạch đầu dòng (4 thuộc tính ưu việt thầm lặng nhất của sản phẩm).
- rating: Điểm đánh giá trung bình cao cấp (ví dụ: từ 4.5 đến 5.0).
- reviewCount: Số lượng đánh giá tượng trưng sắc sảo (ví dụ: từ 30 đến 300).
- image: Chọn một ID ảnh tuyệt đẹp, cực kỳ chất lượng, sắc nét từ Unsplash phù hợp chính xác tuyệt đối loại sản phẩm này. Hãy trả về ĐẦY ĐỦ đường link cụ thể để hiển thị ảnh có dạng: \`https://images.unsplash.com/photo-[PHOTO_ID]?w=800&auto=format&fit=crop&q=80\`. Tránh ảnh hỏng, hãy tham khảo các ID thật như:
  + Nếu là giày hoặc Sneakers: photo-1542291026-7eec264c27ff
  + Nếu là áo blazer/hoodie/clothes: photo-1591047139829-d91aecb6caea hoặc photo-1551488831-00ddcb6c6bd3
  + Nếu là loa/tai nghe/đồ công nghệ: photo-1618042164219-62c820f10723 hoặc photo-1505740420928-5e560c06d30e
  + Nếu là nến thơm: photo-1603006905003-be475563bc59
  + Nếu là bình giữ nhiệt/cốc: photo-1602143407151-7111542de6e8
  + Nếu là nước hoa/son môi: photo-1541643600914-78b084683601
  + Nếu là sổ tay/bút: photo-1531346878377-a5ec20888e57
  + Các sản phẩm gia dụng, thực phẩm khác: https://images.unsplash.com/photo-1513151233558-d860c5398176 hoặc một ID bất kỳ phù hợp phong cách cao cấp mà bạn biết vững tin 100%.

Yêu cầu định dạng phản hồi tối thiểu phải chính xác là JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            price: { type: Type.INTEGER },
            category: { type: Type.STRING },
            image: { type: Type.STRING },
            description: { type: Type.STRING },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            rating: { type: Type.NUMBER },
            reviewCount: { type: Type.INTEGER },
          },
          required: ["title", "price", "category", "image", "description", "features", "rating", "reviewCount"],
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      },
    });

    const resultText = response.text?.trim() || "";
    console.log("Gemini parsed response successfully.");
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    // Graceful fallback to smart simulation in case of runtime key issue / limitation
    const fallbackData = simulateShopeeExtraction(url, userHint);
    res.json(fallbackData);
  }
});

// Helper simulation function for offline/fallback mode
function simulateShopeeExtraction(url: string, userHint: string) {
  // Infer nice words from URL
  let parsedName = "Sản phẩm Shopee Premium";
  let guessedCategory = "Khác";
  let guessedImage = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80"; // default golden layout
  let guessedPrice = 450000;

  const lowercaseUrl = url.toLowerCase();

  if (userHint) {
    parsedName = userHint;
  } else {
    // Try to extract from slug
    const parts = url.split("/");
    const slug = parts.find(p => p.includes("-i.") || p.length > 15) || "";
    if (slug) {
      const cleanSlug = slug.split("-i.")[0].replace(/-/g, " ");
      if (cleanSlug && cleanSlug.length > 3) {
        parsedName = decodeURIComponent(cleanSlug)
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }
  }

  // Map keywords to categories and authentic Unsplash photos
  if (lowercaseUrl.includes("ao") || lowercaseUrl.includes("quan") || lowercaseUrl.includes("blazer") || lowercaseUrl.includes("vay") || lowercaseUrl.includes("jacket") || lowercaseUrl.includes("thoi-trang") || (userHint && /áo|quần|váy|đầm|giày|túi|mặc/i.test(userHint))) {
    guessedCategory = "Thời trang";
    guessedImage = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80"; // blazer khaki
    guessedPrice = 680000;
  } else if (lowercaseUrl.includes("loa") || lowercaseUrl.includes("phone") || lowercaseUrl.includes("tai-nghe") || lowercaseUrl.includes("chuot") || lowercaseUrl.includes("phim") || lowercaseUrl.includes("dien-tu") || (userHint && /loa|tai nghe|chuột|bàn phím|led|máy/i.test(userHint))) {
    guessedCategory = "Đồ điện tử";
    guessedImage = "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80"; // wood speaker
    guessedPrice = 1350000;
  } else if (lowercaseUrl.includes("son") || lowercaseUrl.includes("kem") || lowercaseUrl.includes("nuoc-hoa") || lowercaseUrl.includes("perfume") || lowercaseUrl.includes("my-pham") || (userHint && /son|môi|mỹ phẩm|nước hoa|serum|da/i.test(userHint))) {
    guessedCategory = "Mỹ phẩm";
    guessedImage = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80"; // perfume bottle
    guessedPrice = 1890000;
  } else if (lowercaseUrl.includes("nen") || lowercaseUrl.includes("den-om") || lowercaseUrl.includes("tranh") || lowercaseUrl.includes("tham") || (userHint && /nến|thơm|phòng|rèm|decor|tranh/i.test(userHint))) {
    guessedCategory = "Phòng khách";
    guessedImage = "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80"; // scented candle
    guessedPrice = 390000;
  } else if (lowercaseUrl.includes("binh") || lowercaseUrl.includes("coc") || lowercaseUrl.includes("ly") || lowercaseUrl.includes("gia-dung") || (userHint && /bình|ly|cốc|chảo|nồi|bếp/i.test(userHint))) {
    guessedCategory = "Đồ gia dụng";
    guessedImage = "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"; // tumbler
    guessedPrice = 450000;
  } else if (lowercaseUrl.includes("so") || lowercaseUrl.includes("vo") || lowercaseUrl.includes("but") || (userHint && /sổ|notebook|bút|vở/i.test(userHint))) {
    guessedCategory = "Khác";
    guessedImage = "https://images.unsplash.com/photo-1531346878377-a5ec20888e57?w=800&auto=format&fit=crop&q=80"; // notebook
    guessedPrice = 280000;
  }

  // Refine titles elegantly
  if (parsedName === "Sản phẩm Shopee Premium") {
    parsedName = `Sản Phẩm Tối Giản ${guessedCategory === "Khác" ? "Mới" : guessedCategory}`;
  }

  return {
    title: parsedName,
    price: guessedPrice,
    category: guessedCategory,
    image: guessedImage,
    description: `Tác phẩm hoàn mỹ mang đậm triết lý thiết kế tối giản, tập trung vào hoàn thiện tinh túy từng đường nét. Sản phẩm hứa hẹn đem lại trải nghiệm sang trọng vượt thời gian, bổ sung hoàn hảo phong cách thời thượng tinh tế của chủ nhân sở hữu.`,
    features: [
      "Chất liệu cao cấp từ nhà cung ứng uy tín",
      "Gia công tỉ mỉ bằng công nghệ thủ công đạt chuẩn",
      "Thiết kế bền vững thích nghi đa không gian sống",
      "Thân thiện môi trường và an toàn cho sức khỏe"
    ],
    rating: 4.8 + Math.round(Math.random() * 2) / 10,
    reviewCount: 20 + Math.floor(Math.random() * 250)
  };
}

// Vite integration middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server runs on port ${PORT}`);
  });
}

startServer();
