// // REST EVENT
// {
//   asks: [
//     [
//       "exchange",
//       "timestamp",
//       "timestampNanoseconds",
//       "isBid",
//       "price",
//       "volume",
//       "numOrders"
//     ]
//   ],
//   bids: [
//     [
//       "exchange",
//       "timestamp",
//       "timestampNanoseconds",
//       "isBid",
//       "price",
//       "volume",
//       "numOrders"
//     ]
//   ]
// }

// // REST SNAPSHOT
// {
//   asks: [
//     [
//       "price"
//       "volume"
//       "numOrders"
//       "timestamp"
//     ]
//   ],
//   bids: [
//     [
//       "price"
//       "volume"
//       "numOrders"
//       "timestamp"
//     ]
//   ]
// }

// // WS EVENT
// "result": [
//   [
//     "gdax",        < - exchange
//     "btc_usd",     < - pair
//     1554255211066, < - timestamp
//     849121,        < - timestampNanoseconds
//     4935.73,       < - price
//     2.1,           < - volume
//     true < - isBid
//   ]
// ]

// WS SNAPSHOT
// "result": [
//   [
//     "gdax",        < - exchange
//     "btc_usd",   < - pair
//     1554255211066, < - timestamp
//     849121,        < - timestampNanoseconds
//     4935.73,       < - price
//     2.1,           < - volume
//     true < - isBid
//   ],
//   ...  // contains the complete snapshot
// ]

function processData(list, type, desc) {
  const res = []
  // Convert to data points
  for (var i = 0; i < list.length; i++) {
    list[i] = {
      value: Number(list[i].price),
      volume: Number(list[i].volume),
    };
  }

  // Sort list just in case
  list.sort(function (a, b) {
    if (a.value > b.value) {
      return 1;
    } else if (a.value < b.value) {
      return -1;
    } else {
      return 0;
    }
  });

  // Calculate cummulative volume
  if (desc) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (i < list.length - 1) {
        list[i].totalvolume = list[i + 1].totalvolume + list[i].volume;
      } else {
        list[i].totalvolume = list[i].volume;
      }
      var dp = {};
      dp["value"] = list[i].value;
      dp[type + "volume"] = list[i].volume;
      dp[type + "totalvolume"] = list[i].totalvolume;
      res.unshift(dp);
    }
  } else {
    for (var i = 0; i < list.length; i++) {
      if (i > 0) {
        list[i].totalvolume = list[i - 1].totalvolume + list[i].volume;
      } else {
        list[i].totalvolume = list[i].volume;
      }
      var dp = {};
      dp["value"] = list[i].value;
      dp[type + "volume"] = list[i].volume;
      dp[type + "totalvolume"] = list[i].totalvolume;
      res.push(dp);
    }
  }

  return res
}

const formatTypeItem = (type, item) => {
  const f = {
    price: item.price,
    value: item.price,
    volume: item.volume,
    [`${type}volume`]: item.volume,
    [`${type}totalvolume`]: item.totalVolume,
  }
  console.log('formatTypeItem', f)
  return f
}

export class Point {
  constructor(item) {
    // NOTE: This has been standardized to:
    //   [
    //     "gdax",        < - exchange
    //     "btc_usd",     < - pair
    //     1554255211066, < - timestamp
    //     849121,        < - timestampNanoseconds
    //     4935.73,       < - price
    //     2.1,           < - volume
    //     true < - isBid
    //   ]

    // Essentials
    this.price = item[4]
    this.volume = item[5]
    this.type = item[6] ? 'bids' : 'asks'
    this.totalvolume = 0

    // Non-essentials:
    // this.exchange = item[0] || ''
    // this.pair = item[1] || ''

    return this
  }
  toJSON() {
    return { value: this.price, [`${this.type}volume`]: this.volume, [`${this.type}totalvolume`]: this.totalvolume }
  }
}

export class OrderBook {

  constructor() {
    // Raw data set
    this.bidsRaw = []
    this.asksRaw = []

    // computed & sorted data set
    this.bids = new Map()
    this.asks = new Map()

    // computed & sorted combined
    this.orderbook = {}
    this.orderbookBucketed = {}
    this.orderbookBucketThreshold = 10
    return this
  }

  // Removes ALL previous points
  // Loads all new points into their respective raw slots
  initializePoints({ bids, asks }) {
    this.bids = new Map()
    this.asks = new Map()

    // Load the sets
    bids.forEach(i => {
      this.addPoint(i)
    })
    asks.forEach(i => {
      this.addPoint(i)
    })

    return this
  }

  pointExists(point) {
    return point.isBid ? this.bids.has(point.price) : this.asks.has(point.price)
  }

  inAsks(point) {
    return this.asks.has(point.price)
  }

  inBids(point) {
    return this.bids.has(point.price)
  }

  pointMatch(point) {
    return this.inBids(point.price) && this.inAsks(point.price)
  }

  addPoint(item) {
    const p = new Point(item)
    let prev

    // add to the raw items
    this[`${p.type}Raw`].push(p)

    // if it has, math ADD
    if (this.inBids(p) || this.inAsks(p)) {
      prev = this[p.type].get(p.price)
    }

    if (prev && prev.price) {
      prev.volume += p.volume
      this[prev.type].set(prev.price, prev)
    } else {
      this[p.type].set(p.price, p)
    }

    return this
  }

  removePoint(item) {
    const p = new Point(item)

    // add to the raw items
    const arrRaw = this[`${p.type}Raw`]
    let idxRaw
    arrRaw.forEach((i, idx) => {
      if (i.price === p.price && i.volume === p.volume) idxRaw = idx
    })
    this[`${p.type}Raw`].splice(idxRaw, 1)

    // if it has, math ADD
    if (this.inBids(p) || this.inAsks(p)) {
      const prev = this[prev.type].get(p.price)
      prev.volume -= p.volume
      if (prev.volume <= 0) this[p.type].delete(p.price)
      else this[prev.type].set(prev)
    }

    return this
  }

  // Determine if the point is an Add or Remove operation, based on delta event
  deltaPoint(item) {
    // TODO:

    return this
  }

  // Returns cumulative set
  getOrderbook() {
    return {
      bids: processData([...this.bids.values()], "bids", true),
      asks: processData([...this.asks.values()], "asks", false),
    }
  }

  // Returns bucketed cumulative sets
  getOrderbookBucketed(bucketSize) {
    const size = bucketSize || this.orderbookBucketThreshold
    const allBids = new Map()
    const allAsks = new Map()
    const bids = []
    const asks = []

    // loop bids/asks and add each tick to the modulo of a bucket
    this.bids.forEach(bid => {
      const bucket = bid.price - (bid.price % size)
      const bucketItem = allBids.get(bucket)
      if (bucketItem) {
        bucketItem.price = bucket
        bucketItem.volume += bid.volume
        allBids.set(bucket, bucketItem)
      } else {
        allBids.set(bucket, bid)
      }
    })
    this.asks.forEach(ask => {
      const bucket = ask.price - (ask.price % size)
      const bucketItem = allAsks.get(bucket)
      if (bucketItem) {
        bucketItem.price = bucket
        bucketItem.volume += ask.volume
        allAsks.set(bucket, bucketItem)
      } else {
        allAsks.set(bucket, ask)
      }
    })

    // Lastly, tally all the cumulative volumes the farther from a specific starting point
    allBids.forEach((val, key) => {
      // get total volume of all items below for trade ladder
      const totalVolume = [...Array.from(allBids.values())]
        .filter(i => i.price >= key)
        .reduce((acc, cur) => acc + cur.volume, 0)
      bids.push({ ...val, totalVolume: parseFloat(totalVolume).toFixed(6) })
    })
    allAsks.forEach((val, key) => {
      // get total volume of all items below for trade ladder
      const totalVolume = [...Array.from(allAsks.values())]
        .filter(i => i.price <= key)
        .reduce((acc, cur) => acc + cur.volume, 0)
      asks.unshift({ ...val, totalVolume: parseFloat(totalVolume).toFixed(6) })
    })

    // return sorted arrays by type
    return { bids: bids.slice(0, 9), asks: asks.slice(0, 9) }
  }
}

// Vue plugin setup
export default {
  install: (app) => {
    app.config.globalProperties.$Point = Point
    app.config.globalProperties.$OrderBook = OrderBook
  }
}