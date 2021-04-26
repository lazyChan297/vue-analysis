import reactive from './reactive.js'
import Watcher from './watcher.js'
import computed from './computed.js'
import watch from './watch.js'

let hotel = {
    address: '人民中路111号',
    price: 1000,
    days: 1
}

let total = {
    days: 1
}

reactive(hotel)
reactive(total)

let customer_louis = new Watcher(() => {
    console.log(`louis already received the address ${hotel.address}`)
})

let customer_jackson = new Watcher(() => {
    console.log(`jackson already received the address ${hotel.address}`)
})

hotel.address = '人民中路112号'

let sum = computed(() => {
    
    log(`Latest price is ${total.days * hotel.price}`)
})

// sum计算属性的依赖
let depend = sum.value

function log(str) { console.log(str) }

hotel.price = 900

total.days = 3

watch(function(){
    return hotel.address
}, (val, oldVal) => {
    log(`地址已经从${oldVal}替换为新地址：${val}`)
})

hotel.address = '人民中路113号'