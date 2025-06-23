'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === 'function' ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var client_1 = require('./client');
var schema_1 = require('./schema');
function seed() {
  return __awaiter(this, void 0, void 0, function () {
    var userId, insertedClients, insertedOrders;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          userId = 'sample-user-id';
          // 1. Delete all data from all tables (order matters for foreign keys)
          return [4 /*yield*/, client_1.db.delete(schema_1.payments)];
        case 1:
          // 1. Delete all data from all tables (order matters for foreign keys)
          _a.sent();
          return [4 /*yield*/, client_1.db.delete(schema_1.orders)];
        case 2:
          _a.sent();
          return [4 /*yield*/, client_1.db.delete(schema_1.inventory)];
        case 3:
          _a.sent();
          return [4 /*yield*/, client_1.db.delete(schema_1.clients)];
        case 4:
          _a.sent();
          return [
            4 /*yield*/,
            client_1.db
              .insert(schema_1.clients)
              .values([
                {
                  user_id: userId,
                  name: 'Ama Mensah',
                  phone: '0244123456',
                  email: 'ama@example.com',
                  neck: 36,
                  chest: 90,
                  bust: 92,
                  waist: 70,
                  hips: 98,
                  thigh: 55,
                  inseam: 80,
                  arm_length: 60,
                  outseam: 100,
                  ankle: 22,
                  shoulder: 40,
                  sleeve_length: 60,
                  knee: 38,
                  wrist: 16,
                  rise: 28,
                  bicep: 30,
                  notes: 'Prefers Ankara fabrics',
                },
                {
                  user_id: userId,
                  name: 'Kwame Boateng',
                  phone: '0209876543',
                  email: 'kwame@example.com',
                  neck: 40,
                  chest: 100,
                  bust: 0,
                  waist: 85,
                  hips: 100,
                  thigh: 60,
                  inseam: 85,
                  arm_length: 65,
                  outseam: 105,
                  ankle: 24,
                  shoulder: 45,
                  sleeve_length: 65,
                  knee: 42,
                  wrist: 18,
                  rise: 30,
                  bicep: 32,
                  notes: 'Likes slim fit',
                },
                {
                  user_id: userId,
                  name: 'Efua Sarpong',
                  phone: '0261234567',
                  email: 'efua@example.com',
                  neck: 34,
                  chest: 85,
                  bust: 88,
                  waist: 68,
                  hips: 95,
                  thigh: 53,
                  inseam: 78,
                  arm_length: 58,
                  outseam: 98,
                  ankle: 21,
                  shoulder: 38,
                  sleeve_length: 58,
                  knee: 36,
                  wrist: 15,
                  rise: 27,
                  bicep: 28,
                  notes: 'Prefers bright colors',
                },
                {
                  user_id: userId,
                  name: 'Yaw Ofori',
                  phone: '0277654321',
                  email: 'yaw@example.com',
                  neck: 42,
                  chest: 105,
                  bust: 0,
                  waist: 90,
                  hips: 105,
                  thigh: 62,
                  inseam: 88,
                  arm_length: 67,
                  outseam: 110,
                  ankle: 25,
                  shoulder: 47,
                  sleeve_length: 67,
                  knee: 44,
                  wrist: 19,
                  rise: 32,
                  bicep: 34,
                  notes: 'Tall, prefers classic styles',
                },
                {
                  user_id: userId,
                  name: 'Akosua Addo',
                  phone: '0256789123',
                  email: 'akosua@example.com',
                  neck: 35,
                  chest: 88,
                  bust: 90,
                  waist: 72,
                  hips: 97,
                  thigh: 54,
                  inseam: 79,
                  arm_length: 59,
                  outseam: 99,
                  ankle: 22,
                  shoulder: 39,
                  sleeve_length: 59,
                  knee: 37,
                  wrist: 16,
                  rise: 28,
                  bicep: 29,
                  notes: 'Likes modern designs',
                },
              ])
              .returning(),
          ];
        case 5:
          insertedClients = _a.sent();
          // 3. Insert 5 sample inventory items
          return [
            4 /*yield*/,
            client_1.db.insert(schema_1.inventory).values([
              {
                user_id: userId,
                name: 'Ankara Fabric',
                category: 'Fabric',
                quantity: 25,
                unit: 'yards',
                low_stock_alert: 5,
              },
              {
                user_id: userId,
                name: 'Thread - Black',
                category: 'Thread',
                quantity: 100,
                unit: 'spools',
                low_stock_alert: 20,
              },
              {
                user_id: userId,
                name: 'Buttons',
                category: 'Accessory',
                quantity: 200,
                unit: 'pieces',
                low_stock_alert: 50,
              },
              {
                user_id: userId,
                name: 'Zippers',
                category: 'Accessory',
                quantity: 15,
                unit: 'pieces',
                low_stock_alert: 10,
              },
              {
                user_id: userId,
                name: 'Lining Material',
                category: 'Fabric',
                quantity: 40,
                unit: 'yards',
                low_stock_alert: 8,
              },
            ]),
          ];
        case 6:
          // 3. Insert 5 sample inventory items
          _a.sent();
          return [
            4 /*yield*/,
            client_1.db
              .insert(schema_1.orders)
              .values([
                {
                  user_id: userId,
                  client_id: insertedClients[0].id,
                  description: 'Kaba and Slit for wedding',
                  status: 'pending',
                  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  total_price: 35000,
                  image_url: null,
                },
                {
                  user_id: userId,
                  client_id: insertedClients[1].id,
                  description: "Men's suit",
                  status: 'in-progress',
                  due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                  total_price: 60000,
                  image_url: null,
                },
                {
                  user_id: userId,
                  client_id: insertedClients[2].id,
                  description: 'Casual dress',
                  status: 'complete',
                  due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                  total_price: 20000,
                  image_url: null,
                },
                {
                  user_id: userId,
                  client_id: insertedClients[3].id,
                  description: 'Traditional smock',
                  status: 'pending',
                  due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  total_price: 45000,
                  image_url: null,
                },
                {
                  user_id: userId,
                  client_id: insertedClients[4].id,
                  description: 'Evening gown',
                  status: 'in-progress',
                  due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                  total_price: 80000,
                  image_url: null,
                },
              ])
              .returning(),
          ];
        case 7:
          insertedOrders = _a.sent();
          // 5. Insert 5 sample payments (with new fields)
          return [
            4 /*yield*/,
            client_1.db.insert(schema_1.payments).values([
              {
                user_id: userId,
                order_id: insertedOrders[0].id,
                amount: 20000,
                method: 'MTN',
                status: 'completed',
                transaction_ref: 'MTN123456',
                payment_type: 'Deposit',
                payment_balance: 15000,
              },
              {
                user_id: userId,
                order_id: insertedOrders[1].id,
                amount: 60000,
                method: 'Cash',
                status: 'completed',
                transaction_ref: 'CASH98765',
                payment_type: 'Full payment',
                payment_balance: 0,
              },
              {
                user_id: userId,
                order_id: insertedOrders[2].id,
                amount: 10000,
                method: 'AirtelTigo',
                status: 'pending',
                transaction_ref: 'ATG54321',
                payment_type: 'Deposit',
                payment_balance: 10000,
              },
              {
                user_id: userId,
                order_id: insertedOrders[3].id,
                amount: 25000,
                method: 'Telecel Cash',
                status: 'completed',
                transaction_ref: 'TCC12345',
                payment_type: 'Deposit',
                payment_balance: 20000,
              },
              {
                user_id: userId,
                order_id: insertedOrders[4].id,
                amount: 80000,
                method: 'MTN',
                status: 'completed',
                transaction_ref: 'MTN654321',
                payment_type: 'Full payment',
                payment_balance: 0,
              },
            ]),
          ];
        case 8:
          // 5. Insert 5 sample payments (with new fields)
          _a.sent();
          console.log('Sample data reset and seeded!');
          process.exit(0);
          return [2 /*return*/];
      }
    });
  });
}
seed().catch(function (err) {
  console.error(err);
  process.exit(1);
});
