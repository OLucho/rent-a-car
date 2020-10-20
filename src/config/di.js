const { default: DIContainer, factory, object, get } = require('rsdi');
const { CarController, CarService, CarRepository, CarModel } = require('../module/car/module');
const {
  ClientController,
  ClientService,
  ClientRepository,
  ClientModel,
} = require('../module/client/module');
const { Sequelize } = require('sequelize');

const session = require('express-session');

function configureSequelizeDatabase() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database.db',
    logging: false,
  });
  return sequelize;
}

function configureClientModel(container) {
  const sequelize = container.get('Sequelize');
  ClientModel.setup(sequelize);
  return ClientModel;
}

function configureCarModel(container) {
  const sequelize = container.get('Sequelize');
  CarModel.setup(sequelize);
  return CarModel;
}

function configureSession() {
  const ONE_WEEK_IN_SECONDS = 604800;
  const sessionOptions = {
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: ONE_WEEK_IN_SECONDS },
  };
  return session(sessionOptions);
}

function addCommonDefinitions(container) {
  container.addDefinitions({
    Sequelize: factory(configureSequelizeDatabase),
    Session: factory(configureSession),
  });
}

function addCarModuleDefinitions(container) {
  container.addDefinitions({
    CarController: object(CarController).construct(get('CarService')),
    CarService: object(CarService).construct(get('CarRepository')),
    CarRepository: object(CarRepository).construct(get('CarModel')),
    CarModel: factory(configureCarModel),
  });
}

function addClientModuleDefinitions(container) {
  container.addDefinitions({
    ClientController: object(ClientController).construct(get('ClientService')),
    ClientService: object(ClientService).construct(get('ClientRepository')),
    ClientRepository: object(ClientRepository).construct(get('ClientModel')),
    ClientModel: factory(configureClientModel),
  });
}

function configureDI() {
  const container = new DIContainer();
  addCarModuleDefinitions(container);
  addClientModuleDefinitions(container);
  addCommonDefinitions(container);
  return container;
}

module.exports = configureDI;
