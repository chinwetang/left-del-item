// pages/account/item/item.js
/**
 * 收藏或者稿件列表的item
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    statusColors: Array,
    item:{
      type:Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //item点击事件
    itemClick:function(){
      this.triggerEvent('click', this.data.item)
    }
  }
})
