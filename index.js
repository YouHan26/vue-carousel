export default {
  name: 'carousel',
  props: {
    width: Number,
    height: Number,
    direction: {
      type: String,
      default: 'horizon'
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    animate: {
      type: Boolean,
      default: true
    },
    animationTime: {
      type: Number,
      default: 300
    },
    slideTime: {
      type: Number,
      default: 2000
    }
  },
  computed: {
    isHorizon() {
      return this.direction === 'horizon'
    },
    rootStyle() {
      const style = this.isHorizon ? {width: `${this.width}px`} : {height: `${this.height}px`}
      return {
        ...style,
        overflow: 'hidden',
      }
    },
    containerStyle() {
      return {
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: this.isHorizon ? 'row' : 'column',
        transform: this.isHorizon ? `translateX(${this.offset}px)` : `translateY(${this.offset}px)`
      }
    },
    itemStyle() {
      const style = this.isHorizon ? {width: `${this.width}px`} : {height: `${this.height}px`}
      return {
        ...style,
        display: 'block'
      }
    }
  },
  data() {
    return {
      offset: -this.getDistance(),
      index: 1,
    }
  },
  mounted() {
    this.len = this.$slots.item.length
    if (this.autoPlay) {
      this.autoPlayTimers = setInterval(() => {
        this.next()
      }, this.slideTime)
    }
  },
  methods: {
    next() {
      this.action(true)
      this.index += 1
    },
    prev() {
      this.action(false)
      this.index += -1
    },
    action(isNext) {
      const {start, end} = this.getOffset(this.index, isNext)
      // is moving
      if (this.moveTimer) {
        this.clearAnimate()
        this.offset = start
      }
      if (this.index % this.len === 0) {
        setTimeout(() => {
          this.offset = -this.getDistance()
        }, this.animationTime)
      } else if (this.index % this.len === 2) {
        setTimeout(() => {
          this.offset = this.getDistance() * (this.len - 1)
        }, this.animationTime)
      }
      this.move(start, end, isNext)
    },
    move(start, end, isNext = true) {
      const spice = (end - start) / (this.animationTime / 16)
      let current = start
      this.moveTimer = setInterval(() => {
        current = current + spice
        if (isNext && (Math.abs(current) > Math.abs(end))) {
          current = end
          this.clearAnimate()
        } else if (!isNext && (Math.abs(current) < Math.abs(end))) {
          current = end
          this.clearAnimate()
        }
        this.offset = current
      }, 16)
    },
    stop() {
      this.autoPlayTimers && clearInterval(this.autoPlayTimers)
    },
    clearAnimate() {
      this.moveTimer && clearInterval(this.moveTimer)
    },
    getDistance() {
      return this.width || this.height || 300
    },
    getOffset(index, isNext = true) {
      const i = index % this.len
      const distance = this.getDistance()
      return {
        start: -distance * i,
        end: -distance * (i + (isNext ? 1 : -1))
      }
    }
  },
  render(h) {
    const slots = this.$slots.item
    const children = [slots[slots.length - 1], ...slots, slots[0]]
    return (
      <div style={this.rootStyle}>
        <div style={this.containerStyle}>
          {children.map((child) => {
            return (
              <div>
                <div style={this.itemStyle}>
                  {child}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}
