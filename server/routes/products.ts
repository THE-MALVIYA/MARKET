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
  const { name, category, price, description, features, image, featured, requirements, productCode } = req.body;

  if (!name || !category || typeof price !== 'number') {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Name, category, and price are required.' });
  }

  const newProduct = db.addProduct({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category,
    price: Math.max(1, price),
    currency: 'USDT',
    description: description || 'Cyber developer toolkit and security utility module.',
    features: Array.isArray(features) ? features : [features].filter(Boolean),
    image: image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    featured: !!featured,
    requirements: Array.isArray(requirements) ? requirements : ['Standard modern Linux/macOS/Windows environment'],
    productCode: productCode || 'TP-' + Math.floor(1000 + Math.random() * 9000),
    version: 'v1.0.0'
  });

  res.status(201).json({ product: newProduct });
});

// PUT /api/products/:id - Admin update product
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
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
