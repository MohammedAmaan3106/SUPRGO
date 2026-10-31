export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  floor?: 0 | 1 | 'both';
  name?: string;
}

export class CollisionSystem {
  private obstacles: BoundingBox2D[] = [];
  private playerRadius: number = 0.42;

  constructor() {
    this.initObstacles();
  }

  private initObstacles() {
    // ========================================================
    // PERIMETER WALLS (BOTH FLOORS)
    // ========================================================
    this.obstacles.push({ minX: -16.0, maxX: 16.0, minZ: -14.5, maxZ: -13.2, floor: 'both', name: 'Back Wall' });
    this.obstacles.push({ minX: -16.5, maxX: -15.2, minZ: -14.0, maxZ: 14.0, floor: 'both', name: 'Left Wall' });
    this.obstacles.push({ minX: 15.2, maxX: 16.5, minZ: -14.0, maxZ: 14.0, floor: 'both', name: 'Right Wall' });

    // Front Wall Ground Floor (sliding entrance at X in [-2.5, 2.5])
    this.obstacles.push({ minX: -16.0, maxX: -2.8, minZ: 13.2, maxZ: 14.2, floor: 0, name: 'GF Front Wall Left' });
    this.obstacles.push({ minX: 2.8, maxX: 16.0, minZ: 13.2, maxZ: 14.2, floor: 0, name: 'GF Front Wall Right' });
    this.obstacles.push({ minX: -8.0, maxX: 8.0, minZ: 17.5, maxZ: 19.0, floor: 0, name: 'Entrance Porch Gate' });
    this.obstacles.push({ minX: -8.5, maxX: -7.5, minZ: 13.5, maxZ: 18.0, floor: 0, name: 'Porch Left Rail' });
    this.obstacles.push({ minX: 7.5, maxX: 8.5, minZ: 13.5, maxZ: 18.0, floor: 0, name: 'Porch Right Rail' });

    // Front Wall First Floor (panoramic boutique glass facade, enclosed)
    this.obstacles.push({ minX: -16.0, maxX: 16.0, minZ: 13.5, maxZ: 14.2, floor: 1, name: 'FF Front Wall' });

    // ========================================================
    // 3D ELEVATOR SHAFT WALLS (BOTH FLOORS)
    // Elevator Cabin at X = 0, Z = -11.5 (cabin bounds: X in [-1.5, 1.5], Z in [-13.0, -10.2])
    // ========================================================
    // Left shaft wall
    this.obstacles.push({ minX: -1.9, maxX: -1.5, minZ: -13.4, maxZ: -10.0, floor: 'both', name: 'Lift Left Wall' });
    // Right shaft wall
    this.obstacles.push({ minX: 1.5, maxX: 1.9, minZ: -13.4, maxZ: -10.0, floor: 'both', name: 'Lift Right Wall' });
    // Back shaft wall
    this.obstacles.push({ minX: -1.9, maxX: 1.9, minZ: -13.6, maxZ: -13.0, floor: 'both', name: 'Lift Back Wall' });

    // ========================================================
    // GROUND FLOOR: GROCERY AISLES & CHECKOUT COUNTERS (floor: 0)
    // ========================================================
    // Aisle 1: Produce & Bakery (X = -12.5)
    this.obstacles.push({ minX: -13.6, maxX: -11.4, minZ: -8.8, maxZ: -1.2, floor: 0, name: 'Aisle 1 Rack 1' });
    this.obstacles.push({ minX: -13.6, maxX: -11.4, minZ: 0.2, maxZ: 7.8, floor: 0, name: 'Aisle 1 Rack 2' });

    // Aisle 2: Dairy & Beverage Coolers (X = -6.5)
    this.obstacles.push({ minX: -7.6, maxX: -5.4, minZ: -8.8, maxZ: -1.2, floor: 0, name: 'Aisle 2 Chiller 1' });
    this.obstacles.push({ minX: -7.6, maxX: -5.4, minZ: 0.2, maxZ: 7.8, floor: 0, name: 'Aisle 2 Chiller 2' });

    // Aisle 3: Groceries & Staples (X = -0.5)
    this.obstacles.push({ minX: -1.6, maxX: 0.6, minZ: -8.8, maxZ: -1.2, floor: 0, name: 'Aisle 3 Gondola 1' });
    this.obstacles.push({ minX: -1.6, maxX: 0.6, minZ: 0.2, maxZ: 7.8, floor: 0, name: 'Aisle 3 Gondola 2' });

    // Aisle 4: Snacks & Packaged Foods (X = 5.5)
    this.obstacles.push({ minX: 4.4, maxX: 6.6, minZ: -8.8, maxZ: -1.2, floor: 0, name: 'Aisle 4 Gondola 1' });
    this.obstacles.push({ minX: 4.4, maxX: 6.6, minZ: 0.2, maxZ: 7.8, floor: 0, name: 'Aisle 4 Gondola 2' });

    // Aisle 5: Personal Care & Household (X = 11.5)
    this.obstacles.push({ minX: 10.4, maxX: 12.6, minZ: -8.8, maxZ: -1.2, floor: 0, name: 'Aisle 5 Gondola 1' });
    this.obstacles.push({ minX: 10.4, maxX: 12.6, minZ: 0.2, maxZ: 7.8, floor: 0, name: 'Aisle 5 Gondola 2' });

    // Three Checkout Counters
    this.obstacles.push({ minX: -7.1, maxX: -3.9, minZ: 9.0, maxZ: 11.2, floor: 0, name: 'Checkout Counter 01' });
    this.obstacles.push({ minX: -1.6, maxX: 1.6, minZ: 9.0, maxZ: 11.2, floor: 0, name: 'Checkout Counter 02' });
    this.obstacles.push({ minX: 3.9, maxX: 7.1, minZ: 9.0, maxZ: 11.2, floor: 0, name: 'Checkout Counter 03' });
    this.obstacles.push({ minX: 8.5, maxX: 14.5, minZ: 11.8, maxZ: 12.3, floor: 0, name: 'Trolley Bay Rail' });

    // ========================================================
    // FIRST FLOOR: FASHION & CLOTHING BOUTIQUE (floor: 1)
    // ========================================================
    // First Floor Atrium Glass Railing around elevator
    this.obstacles.push({ minX: -5.0, maxX: -1.8, minZ: -10.2, maxZ: -9.8, floor: 1, name: 'FF Railing Left' });
    this.obstacles.push({ minX: 1.8, maxX: 5.0, minZ: -10.2, maxZ: -9.8, floor: 1, name: 'FF Railing Right' });

    // Aisle F1: Men's Fashion (X = -10.5)
    this.obstacles.push({ minX: -11.5, maxX: -9.5, minZ: -8.0, maxZ: -1.5, floor: 1, name: 'Men Clothing Rails 1' });
    this.obstacles.push({ minX: -11.5, maxX: -9.5, minZ: 0.0, maxZ: 6.5, floor: 1, name: 'Men Clothing Rails 2' });

    // Aisle F2: Women's Boutique (X = -4.0)
    this.obstacles.push({ minX: -5.0, maxX: -3.0, minZ: -8.0, maxZ: -1.5, floor: 1, name: 'Women Boutique Rails 1' });
    this.obstacles.push({ minX: -5.0, maxX: -3.0, minZ: 0.0, maxZ: 6.5, floor: 1, name: 'Women Boutique Rails 2' });

    // Aisle F3: Footwear & Sneakers (X = 4.0)
    this.obstacles.push({ minX: 3.0, maxX: 5.0, minZ: -8.0, maxZ: -1.5, floor: 1, name: 'Footwear Display Wall 1' });
    this.obstacles.push({ minX: 3.0, maxX: 5.0, minZ: 0.0, maxZ: 6.5, floor: 1, name: 'Footwear Display Wall 2' });

    // Aisle F4: Accessories, Bags & Kids (X = 10.5)
    this.obstacles.push({ minX: 9.5, maxX: 11.5, minZ: -8.0, maxZ: -1.5, floor: 1, name: 'Accessories Stand 1' });
    this.obstacles.push({ minX: 9.5, maxX: 11.5, minZ: 0.0, maxZ: 6.5, floor: 1, name: 'Accessories Stand 2' });
  }

  public isPointColliding(
    x: number,
    z: number,
    floor: 0 | 1 = 0,
    isElevatorDoorOpen: boolean = false,
    isInElevator: boolean = false
  ): boolean {
    const r = this.playerRadius;

    // If player is inside the elevator cabin
    if (isInElevator) {
      // Cabin interior bounds: X in [-1.4, 1.4], Z in [-12.8, -10.2]
      if (x - r < -1.45 || x + r > 1.45 || z - r < -12.9) {
        return true;
      }
      // If doors are closed, cannot walk out past Z = -10.15
      if (!isElevatorDoorOpen && z + r > -10.15) {
        return true;
      }
      return false;
    }

    // Closed elevator door obstacle when outside elevator
    if (!isElevatorDoorOpen) {
      if (x + r > -1.5 && x - r < 1.5 && z + r > -10.4 && z - r < -9.8) {
        return true;
      }
    }

    for (const obs of this.obstacles) {
      if (obs.floor !== 'both' && obs.floor !== floor) {
        continue;
      }

      if (
        x + r > obs.minX &&
        x - r < obs.maxX &&
        z + r > obs.minZ &&
        z - r < obs.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  public resolvePosition(
    currentX: number,
    currentZ: number,
    targetX: number,
    targetZ: number,
    floor: 0 | 1 = 0,
    isElevatorDoorOpen: boolean = false,
    isInElevator: boolean = false
  ): [number, number] {
    if (!this.isPointColliding(targetX, targetZ, floor, isElevatorDoorOpen, isInElevator)) {
      return [targetX, targetZ];
    }
    if (!this.isPointColliding(targetX, currentZ, floor, isElevatorDoorOpen, isInElevator)) {
      return [targetX, currentZ];
    }
    if (!this.isPointColliding(currentX, targetZ, floor, isElevatorDoorOpen, isInElevator)) {
      return [currentX, targetZ];
    }
    return [currentX, currentZ];
  }

  public getObstacles() {
    return this.obstacles;
  }
}

export const collisionSystem = new CollisionSystem();
