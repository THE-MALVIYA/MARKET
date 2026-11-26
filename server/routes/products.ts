import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/products - list all products with optional filtering & search
router.get('/', (req: Request, res: Response) => {
  let products = db.getProducts();

  const search = (req.query.search as string || '').toLowerCase().trim();
  const category = req.query.category as string;
  const featured = req.query.featured as string;
  const sortBy = req.query.sortBy as string;

  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        (p.productCode && p.productCode.toLowerCase().includes(search)) ||
        p.features.some((f) => f.toLowerCase().includes(search))
    );
  }

  if (category && category !== 'All Categories') {
    products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (featured === 'true') {
    products = products.filter((p) => p.featured);
  }

  if (sortBy === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else {
    // Default newest/featured first
    products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  res.json({
    count: products.length,
    products
  });
});

// GET /api/products/categories - distinct categories
router.get('/categories', (req: Request, res: Response) => {
  const products = db.getProducts();
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();
  res.json({ categories });
});

// GET /api/products/:slugOrId - get single product
router.get('/:slugOrId', (req: Request, res: Response) => {
  const product = db.getProductByIdOrSlug(req.params.slugOrId);
  if (!product) {
    return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Product listing not found' });
  }
  res.json({ product });
});

// POST /api/products - Admin create product
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    category,
    price,
    description,
    features,
    image,
    featured,
    requirements,
    productCode,
    version,
    architecture,
    supportedPlatforms,
    licenseType
  } = req.body;

  if (!name || !category || typeof price !== 'number') {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Name, category, and price are required.' });
  }

  const newProduct = db.addProduct(
    {
      name: String(name).trim(),
      slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: String(category).trim(),
      price: Math.max(1, price),
      currency: 'USDT',
      description: description || 'Enterprise security infrastructure and developer software suite.',
      features: Array.isArray(features) ? features : [features].filter(Boolean),
      image: image || '/assets/sql_flash_module.jpg',
      rating: 4.9,
      featured: !!featured,
      requirements: Array.isArray(requirements)
        ? requirements
        : ['Linux / macOS / Windows x86_64 or ARM64 environment'],
      productCode: productCode || 'DSK-' + Math.floor(1000 + Math.random() * 9000),
      version: version ? String(version).trim() : 'v1.0.0',
      architecture: architecture ? String(architecture).trim() : 'x86_64 / ARM64',
      supportedPlatforms: Array.isArray(supportedPlatforms)
        ? supportedPlatforms
        : ['Linux', 'Docker', 'macOS', 'Windows'],
      licenseType: licenseType ? String(licenseType).trim() : 'Enterprise Perpetual / 1-Year Updates'
    },
    req.user!.username
  );

  res.status(201).json({ product: newProduct });
});

// PUT /api/products/:id - Admin update product
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    category,
    price,
    description,
    features,
    image,
    featured,
    requirements,
    productCode,
    version,
    architecture,
    supportedPlatforms,
    licenseType
  } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (category !== undefined) updates.category = String(category).trim();
  if (typeof price === 'number' && !Number.isNaN(price)) updates.price = Math.max(1, price);
  if (description !== undefined) updates.description = String(description);
  if (Array.isArray(features)) updates.features = features.map(String);
  if (image !== undefined) updates.image = String(image).trim();
  if (typeof featured === 'boolean') updates.featured = featured;
  if (Array.isArray(requirements)) updates.requirements = requirements.map(String);
  if (productCode !== undefined) updates.productCode = String(productCode).trim();
  if (version !== undefined) updates.version = String(version).trim();
  if (architecture !== undefined) updates.architecture = String(architecture).trim();
  if (Array.isArray(supportedPlatforms)) updates.supportedPlatforms = supportedPlatforms.map(String);
  if (licenseType !== undefined) updates.licenseType = String(licenseType).trim();

  const updated = db.updateProduct(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Product could not be found' });
  }
  res.json({ product: updated });
});

// DELETE /api/products/:id - Admin delete product
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Product could not be found' });
  }
  res.json({ success: true, message: 'Product listing removed' });
});

export default router;
