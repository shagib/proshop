import { getCurrentCart } from '@/actions/cart';
import CartPageLines from '@/components/Cartpagelines';

export default async function CartPage() {
  const cart = await getCurrentCart();

  return (
    <main className="px-8 py-16 max-w-[1200px] mx-auto max-[1024px]:px-4">
      <h1 className="text-4xl font-semibold mb-10">Your Cart</h1>
      {cart && cart.lines.edges.length > 0 ? (
        <CartPageLines initialCart={cart} />
      ) : (
        <p className="text-neutral-500">Your cart is empty.</p>
      )}
    </main>
  );
}