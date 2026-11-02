/* Cookie names shared by the server and the browser. Kept in their own file so
   client components can import them without pulling in the database. */

export const CART_COOKIE = "azmiq_cart";
export const CURRENCY_COOKIE = "azmiq_currency";
export const COUNTRY_COOKIE = "azmiq_country";

/** Readable by the browser so the header can show the basket count on a
    static page. Holds a number only - the cart token itself stays httpOnly. */
export const CART_COUNT_COOKIE = "azmiq_cart_count";

/** "1" while a customer session exists. A display hint for the header only;
    every account page still checks the real httpOnly session. */
export const SIGNED_IN_COOKIE = "azmiq_signed_in";
