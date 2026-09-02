export interface Product  {
    id: string;
    title: string;
    handle: string;
    description: string;
    images: {
        nodes: {
            url: string;
            alternateText: string | null;
        }[];
    };
    priceRange: {
        miniVariantPrice: {
            amount: string;
            currencyCode: string;
        };
    };
    variants: {
        nodes: {
            id: string;
            price: {
                amount: string;
                currencyCode: string;
            };
        }[];
    };
}

export interface ProductsResponse {
    products: {
        nodes: Product[];
    };
}