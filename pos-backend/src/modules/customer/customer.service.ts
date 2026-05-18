import customerRepository from "./customer.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Customer, NewCustomer } from "./customer.schema.js";

const customerService = {
  async getAllCustomers(): Promise<Customer[]> {
    return await customerRepository.findAll();
  },

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await customerRepository.findById(id);
    if (!customer) fail("Customer not found", 404);
    return customer!;
  },

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    return await customerRepository.findByPhone(phone);
  },

  async createCustomer(data: NewCustomer): Promise<Customer> {
    const existing = await customerRepository.findByPhone(data.phone);
    if (existing) fail("Customer with this phone number already exists", 400);
    return await customerRepository.create(data);
  },

  async updateCustomer(id: string, data: Partial<NewCustomer>): Promise<Customer | undefined> {
    await this.getCustomerById(id);
    return await customerRepository.update(id, data);
  },

  async findOrCreateByPhone(name: string, phone: string): Promise<Customer | undefined> {
    let customer = await customerRepository.findByPhone(phone);
    if (!customer) {
      customer = await customerRepository.create({ name, phone });
    } else if (customer.name !== name) {
      // Optional: Update name if it changed
      customer = await customerRepository.update(customer.id, { name });
    }
    return customer;
  }
};

export default customerService;
