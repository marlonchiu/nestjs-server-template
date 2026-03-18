import { users } from '../modules/user/entities/user.entity';
import { orders } from '../modules/order/entities/order.entity';

export const schema = {
  users,
  orders,
};

export { users, orders };
export type User = import('../modules/user/entities/user.entity').User;
export type Order = import('../modules/order/entities/order.entity').Order;
