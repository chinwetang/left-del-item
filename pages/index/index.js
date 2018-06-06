
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],//列表主数据
    checkedId: ''//当前操作的item id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //TODO
    //this.listFirst()
    var list = new Array()
    var item = new Object()
    var urlItem = new Object()
    item.title = '"蓝月亮节”启动 实现消费者洁净现梦想“蓝但是离开富士康京东方会计师跨境电商开发就'
    urlItem.picUrl = 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2495369920,2556139511&fm=27&gp=0.jpg'
    item.displayPic = urlItem
    item.publishTime = new Date().getTime()
    item.title = '伟大的小粉丝'
    item.type = '1'
    for (var i = 1; i < 12; i++) {
      var newitem = new Object()
      newitem.title = item.title
      newitem.displayPic = urlItem
      newitem.publishTime = item.publishTime
      newitem.title = item.title
      newitem.type = item.type
      newitem.contentId=i+'12';
      list.push(newitem)
    }
    this.setData({ 
      list
    })
  },
  
  /**点击item */
  itemClick: function (event) {
    
  },
  /**点击删除 */
  delClick: function (event) {
    let that = this
    wx.showModal({
      content: '是否删除？',
      cancelText: '取消',
      confirmText: '删除',
      confirmColor: '#0058F1',
      success: res => {
        that.setData({
          leftStyle: 0,
        })
        if (res.confirm) {
          
        } else {
        }
      }
    })
  },
  /**未被操作的其他item复位 */
  restoration: function (event) {
    this.setData({
      checkedId: event.detail
    })
  }
})