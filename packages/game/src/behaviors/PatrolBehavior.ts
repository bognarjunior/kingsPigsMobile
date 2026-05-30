export class PatrolBehavior {
  private direction: 1 | -1 = 1

  constructor(
    private readonly leftBound: number,
    private readonly rightBound: number,
    private readonly speed: number,
  ) {}

  velocityFor(currentX: number): number {
    if (currentX <= this.leftBound) {
      this.direction = 1
    } else if (currentX >= this.rightBound) {
      this.direction = -1
    }

    return this.direction * this.speed
  }
}
