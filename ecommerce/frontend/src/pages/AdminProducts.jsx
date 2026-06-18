import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../redux/slices/productSlice';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 100 })); // load all/large batch for management
  }, [dispatch]);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice('');
    setDiscountPrice('');
    setCategory('');
    setBrand('');
    setStock('');
    setDescription('');
    setImages('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setPrice(product.price);
    setDiscountPrice(product.discountPrice || '');
    setCategory(product.category);
    setBrand(product.brand);
    setStock(product.stock);
    setDescription(product.description);
    setImages(product.images.join(', '));
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedImages = images.split(',').map((img) => img.trim()).filter((img) => img.length > 0);
    const productData = {
      title,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      brand,
      stock: Number(stock),
      description,
      images: parsedImages.length > 0 ? parsedImages : undefined,
    };

    if (editingProduct) {
      dispatch(updateProduct({ id: editingProduct._id, productData }))
        .unwrap()
        .then(() => {
          setModalOpen(false);
          dispatch(fetchProducts({ pageSize: 100 }));
        });
    } else {
      dispatch(createProduct(productData))
        .unwrap()
        .then(() => {
          setModalOpen(false);
          dispatch(fetchProducts({ pageSize: 100 }));
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-gray-150 dark:border-darkBorder/40">
        <div className="text-left">
          <h1 className="text-2xl font-black text-gray-850 dark:text-white m-0">Manage Products</h1>
          <p className="text-xs text-gray-400 mt-1">Catalog editor and inventory control</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 self-start sm:self-auto"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products list Table */}
      <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-darkBorder/40 text-gray-450 dark:text-gray-400 text-left font-bold uppercase tracking-wider">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-darkBorder/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/10">
                    <td className="p-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-darkBorder/40">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                          )}
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1 max-w-[200px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-450">{p.category}</td>
                    <td className="p-3 text-gray-450">{p.brand}</td>
                    <td className="p-3 font-extrabold text-gray-800 dark:text-white">
                      {p.discountPrice > 0 ? (
                        <div className="flex gap-1 items-baseline">
                          <span>${p.discountPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-gray-400 line-through font-normal">${p.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>${p.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-gray-700 dark:text-gray-300">
                      {p.stock === 0 ? (
                        <span className="text-red-500 text-[10px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Out</span>
                      ) : (
                        <span>{p.stock}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 border border-gray-150 dark:border-darkBorder rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-650 dark:text-gray-400"
                          aria-label="Edit product"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 border border-red-100 dark:border-red-500/15 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal Popup */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-gray-50 dark:border-darkBorder/40 pb-4">
              <h3 className="text-lg font-black text-gray-800 dark:text-white m-0">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Precision Audio Headphones"
                    className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Audiotech"
                    className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Electronics"
                    className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 50"
                    min="0"
                    className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Regular Price ($)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 299.99"
                    min="0"
                    step="0.01"
                    className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Discount Price ($ - optional)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="e.g. 249.99"
                    min="0"
                    step="0.01"
                    className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2.5 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold">Image URLs (comma-separated)</label>
                <textarea
                  rows={2}
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1..., https://..."
                  className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold">Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide deep product characteristics..."
                  className="bg-gray-50 dark:bg-darkBg border border-gray-250 dark:border-darkBorder rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-darkBorder/40 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-750 dark:text-gray-300 font-bold py-3 rounded-xl text-sm transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
