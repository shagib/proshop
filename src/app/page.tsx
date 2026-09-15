import { getProducts } from '@/lib/shopify/products';
import ProductCarousel from '../components/ProductCarousel';
import { getHeroBanners } from '@/lib/shopify/banner';
import HeroSection from '@/components/sections/HeroBanner';
import MinimalProductCard from '@/components/sections/NewArrival';

export default async function Home() {
  const products = await getProducts();
  const banners = await getHeroBanners();
  const recentProducts = [...products]
    .sort((firstProduct, secondProduct) =>
      new Date(secondProduct.createdAt).getTime() - new Date(firstProduct.createdAt).getTime(),
    )
    .slice(0, 10);
  // console.log(products);

  return (
    <main className="banner px-8 max-[1024px]:px-4">
      <HeroSection banners={banners} />

      <section className="products mb-25 max-[768px]:mb-15">
        <div className="products-container">

          <ProductCarousel title="Our New Collections"> 
            {recentProducts.map((product) => (
              <MinimalProductCard key={product.id} product={product} />
            ))}
          </ProductCarousel>
        </div>
      </section>

    
      {/* <section className="categories">
        <div className="categories__container">
          <h2 className="categories__heading">Our Top Categories</h2>
          <div className="categories__grid">
            <a href="/collections/bags" className="categories__item">
              <img src="{{ 'cat-bags.jpg' | asset_url }}" alt="Bags" className="categories__image" />
              <span className="categories__label">Bags</span>
            </a>
            <a href="/collections/sunglasses" className="categories__item">
              <img src="{{ 'cat-sunglasses.jpg' | asset_url }}" alt="Sunglasses" className="categories__image" />
              <span className="categories__label">Sunglasses</span>
            </a>
            <a href="/collections/caps-hats" className="categories__item">
              <img src="{{ 'cat-caps.jpg' | asset_url }}" alt="Caps & Hats" className="categories__image" />
              <span className="categories__label">Caps & Hats</span>
            </a>
            <a href="/collections/belts" className="categories__item">
              <img src="{{ 'cat-belts.jpg' | asset_url }}" alt="Belts" className="categories__image" />
              <span className="categories__label">Belts</span>
            </a>
            <a href="/collections/wallets" className="categories__item">
              <img src="{{ 'cat-wallets.jpg' | asset_url }}" alt="Wallets" className="categories__image" />
              <span className="categories__label">Wallets</span>
            </a>
          </div>
        </div>
      </section>

      <section className="promo-banner">
        <div className="promo-banner__container">
          <div className="promo-banner__images">
            <img src="{{ 'promo-1.jpg' | asset_url }}" alt="Sale item" className="promo-banner__img" />
            <img src="{{ 'promo-2.jpg' | asset_url }}" alt="Sale item" className="promo-banner__img" />
            <img src="{{ 'promo-3.jpg' | asset_url }}" alt="Sale item" className="promo-banner__img" />
          </div>
          <div className="promo-banner__content">
            <span className="promo-banner__brand">LOUIS VUITTON</span>
            <h2 className="promo-banner__title">End of season sale up to 50% off</h2>
            <a href="/collections/sale" className="promo-banner__cta btn btn--primary">SHOP NOW</a>
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="featured__container">
          <div className="featured__content">
            <span className="featured__eyebrow">Care For Your Skin</span>
            <h2 className="featured__title">Natural self care products</h2>
            <p className="featured__description">
              We create safe products that really work and are
              designed to make you feel good
            </p>
          </div>
          <div className="featured__grid">
            <div className="featured__card">
              <img src="{{ product.featured_image | img_url: '300x' }}" alt="Small bag pack" />
              <h3 className="featured__card-title">Small bag pack</h3>
              <span className="featured__card-price">$80.00</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lookbook">
        <div className="lookbook__container">
          <div className="lookbook__content">
            <span className="lookbook__eyebrow">Care For Your Skin</span>
            <h2 className="lookbook__title">Natural self care products</h2>
            <p className="lookbook__description">
              We create safe products that really work and are
              designed to make you feel good
            </p>
            <a href="/collections/all" className="lookbook__cta btn btn--primary">SHOP NOW</a>
          </div>
          <div className="lookbook__gallery">
            <img src="{{ 'look-1.jpg' | asset_url }}" alt="Lookbook" className="lookbook__img lookbook__img--large" />
            <img src="{{ 'look-2.jpg' | asset_url }}" alt="Lookbook" className="lookbook__img" />
            <img src="{{ 'look-3.jpg' | asset_url }}" alt="Lookbook" className="lookbook__img" />
          </div>
        </div>
      </section>

      <section className="tabbed-products">
        <div className="tabbed-products__container">
          <h2 className="tabbed-products__heading">Our New Collections</h2>
          <div className="tabbed-products__tabs">
            <button className="tabbed-products__tab tabbed-products__tab--active">Luna Watch</button>
            <button className="tabbed-products__tab">Aura Bag</button>
            <button className="tabbed-products__tab">Muse Shades</button>
          </div>
          <div className="tabbed-products__grid">
            <div className="tabbed-products__card">
              <img src="{{ product.featured_image | img_url: '400x' }}" alt="Small bag pack" />
              <h3 className="tabbed-products__card-title">Small bag pack</h3>
              <span className="tabbed-products__card-price">$80.00</span>
            </div>
          </div>
        </div>
      </section>

      <section className="accessories">
        <div className="accessories__container">
          <div className="accessories__grid">
            <div className="accessories__card">
              <div className="accessories__card-image">
                <img src="{{ product.featured_image | img_url: '400x' }}" alt="T-Lock Canvas" />
              </div>
              <div className="accessories__card-info">
                <span className="accessories__card-category">Accessory</span>
                <h3 className="accessories__card-title">T-Lock Canvas Top Handle Ecru/ Tan</h3>
                <span className="accessories__card-price">$70.00 — $100.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="collection-banner">
        <div className="collection-banner__container">
          <h2 className="collection-banner__heading">Our New Collections</h2>
          <div className="collection-banner__grid">
            <div className="collection-banner__item collection-banner__item--large">
              <img src="{{ 'banner-1.jpg' | asset_url }}" alt="Collection" />
            </div>
            <div className="collection-banner__item">
              <img src="{{ 'banner-2.jpg' | asset_url }}" alt="Collection" />
            </div>
            <div className="collection-banner__item">
              <img src="{{ 'banner-3.jpg' | asset_url }}" alt="Collection" />
            </div>
          </div>
        </div>
      </section>

      <section className="faq">
        <div className="faq__container">
          <div className="faq__header">
            <h2 className="faq__title">We are answerable!</h2>
            <p className="faq__subtitle">
              Find detailed answers to the most common questions about our products, shipping, returns, and custom
            </p>
          </div>
          <div className="faq__list">
            <details className="faq__item" open>
              <summary className="faq__question">What materials do you use?</summary>
              <div className="faq__answer">
                <p>We use high-quality, durable materials including premium leather, stainless steel, and impact-resistant materials.</p>
              </div>
            </details>
            <details className="faq__item">
              <summary className="faq__question">Do you offer international shipping?</summary>
              <div className="faq__answer"><p>Yes, we ship worldwide.</p></div>
            </details>
            <details className="faq__item">
              <summary className="faq__question">What is your return policy?</summary>
              <div className="faq__answer"><p>30-day return policy on all items.</p></div>
            </details>
            <details className="faq__item">
              <summary className="faq__question">How can I track my order?</summary>
              <div className="faq__answer"><p>Via your account dashboard.</p></div>
            </details>
            <details className="faq__item">
              <summary className="faq__question">What payment methods do you accept?</summary>
              <div className="faq__answer"><p>Visa, Mastercard, PayPal, and more.</p></div>
            </details>
          </div>
        </div>
      </section>

      <section className="blog">
        <div className="blog__container">
          <h2 className="blog__heading">All About Proshop</h2>
          <div className="blog__grid">
            <article className="blog__card">
              <img src="{{ article.image | img_url: '600x' }}" alt="Blog post" className="blog__card-image" />
            </article>
          </div>
        </div>
      </section>

      <section className="category-slider">
        <div className="category-slider__container">
          <div className="category-slider__track">
            <a href="/collections/footwear" className="category-slider__item">
              <span className="category-slider__name">FOOTWEAR</span>
              <span className="category-slider__count">20 Products</span>
              <span className="category-slider__cta">SHOP NOW</span>
            </a>
            <a href="/collections/trousers" className="category-slider__item">
              <span className="category-slider__name">TROUSERS</span>
              <span className="category-slider__count">20 Products</span>
              <span className="category-slider__cta">SHOP NOW</span>
            </a>
            <a href="/collections/fashion" className="category-slider__item">
              <span className="category-slider__name">FASHION</span>
              <span className="category-slider__count">20 Products</span>
              <span className="category-slider__cta">SHOP NOW</span>
            </a>
            <a href="/collections/sports" className="category-slider__item">
              <span className="category-slider__name">SPORTS</span>
              <span className="category-slider__count">20 Products</span>
              <span className="category-slider__cta">SHOP NOW</span>
            </a>
          </div>
        </div>
      </section>

      <section className="instagram">
        <div className="instagram__grid">
          <a href="#" className="instagram__item"><img src="{{ 'insta-1.jpg' | asset_url }}" alt="Instagram" /></a>
          <a href="#" className="instagram__item"><img src="{{ 'insta-2.jpg' | asset_url }}" alt="Instagram" /></a>
          <a href="#" className="instagram__item"><img src="{{ 'insta-3.jpg' | asset_url }}" alt="Instagram" /></a>
          <a href="#" className="instagram__item"><img src="{{ 'insta-4.jpg' | asset_url }}" alt="Instagram" /></a>
          <a href="#" className="instagram__item"><img src="{{ 'insta-5.jpg' | asset_url }}" alt="Instagram" /></a>
          <a href="#" className="instagram__item"><img src="{{ 'insta-6.jpg' | asset_url }}" alt="Instagram" /></a>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter__container">
          <h2 className="newsletter__title">Our Newsletter</h2>
          <p className="newsletter__text">
            It Only Takes A Second To Be The First To Find Out About Our Latest News
          </p>
          <form className="newsletter__form" action="/contact" method="POST">
            <input type="email" name="email" placeholder="Your Email Here" className="newsletter__input" required />
            <button type="submit" className="newsletter__btn btn btn--primary">SUBSCRIBE</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__container">
          <div className="footer__brand">
            <a href="#" className="footer__logo">PROSHOP</a>
            <address className="footer__address">
              10 Downing Street, Westminster,
              London, SW 1A 2AA, United Kingdom
            </address>
            <a href="mailto:info@orimashop.com" className="footer__email">info@orimashop.com</a>
            <a href="tel:1-800-123-4567" className="footer__phone">1-800-123-4567</a>
          </div>

          <div className="footer__links">
          </div>

          <div className="footer__bottom">
            <p className="footer__copyright">&copy; 2026 - PROSHOP. All Rights Reserved.</p>
          </div>
        </div>
      </footer> */}


    </main>
  );
}