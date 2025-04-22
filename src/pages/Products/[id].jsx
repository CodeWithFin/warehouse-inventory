// src/pages/Products/[id].jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { format } from 'date-fns';
import StockStatusBadge from '../../../components/ui/StockStatusBadge';
import StockChangeModal from '../../../components/modals/StockChangeModal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const formatFirebaseDate = (timestamp) => {
            if (!timestamp) return 'N/A';
            if (timestamp.toDate) return format(timestamp.toDate(), 'MMM dd, yyyy HH:mm');
            return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
          };
        // Fetch product
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        }

        // Fetch batches
        const batchesQuery = query(
          collection(db, 'batches'),
          where('productId', '==', id)
        );
        const batchesSnapshot = await getDocs(batchesQuery);
        const batchesData = batchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBatches(batchesData);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="ml-64 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {product.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{product.brand}</p>
        </div>
        <StockStatusBadge 
          quantity={product.quantity} 
          threshold={product.lowStockThreshold || 5} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
            Product Details
          </h3>
          <div className="space-y-3">
            <p><span className="font-medium">SKU:</span> {product.sku}</p>
            <p><span className="font-medium">Category:</span> {product.category}</p>
            <p><span className="font-medium">Unit:</span> {product.unit}</p>
            <p><span className="font-medium">Location:</span> {product.location || 'Not specified'}</p>
            <p><span className="font-medium">Low Stock Threshold:</span> {product.lowStockThreshold || 5}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Stock Information
            </h3>
            <button
              onClick={() => setIsStockModalOpen(true)}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
            >
              Adjust Stock
            </button>
          </div>
          <p className="text-3xl font-bold mb-2">{product.quantity} {product.unit}</p>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: {product.lastUpdated ? 
              format(new Date(product.lastUpdated.toDate()), 'MMM dd, yyyy HH:mm') : 
              'N/A'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
            Product Image
          </h3>
          <div className="flex justify-center">
            <img
              src={product.imageUrl || '/placeholder-product.png'}
              alt={product.name}
              className="h-40 object-contain rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 p-6 pb-0">
          Batch Information
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Batch Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {batches.map((batch) => {
                const expiryDate = batch.expiryDate?.toDate();
                const isExpired = expiryDate && expiryDate < new Date();
                const isExpiringSoon = expiryDate && 
                  expiryDate > new Date() && 
                  expiryDate < new Date(new Date().setDate(new Date().getDate() + 30));

                return (
                  <tr key={batch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {batch.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {batch.quantity} {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {expiryDate ? format(expiryDate, 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Expired
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Expiring Soon
                        </span>
                      ) : expiryDate ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          No Expiry
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockChangeModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={product}
        onSave={(updatedProduct, newBatch) => {
          setProduct(updatedProduct);
          if (newBatch) {
            setBatches([...batches, newBatch]);
          }
        }}
      />
    </div>
  );
}