/**
 * 左滑删除item  用在收藏和投稿列表
 */
var INITX = 30;//触发条件的X移动距离
var MAXY = 10;//触发条件
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    delBtnWidth: {
      type: Number,
      value: 164,
    },
    currentId:String,//当前item的唯一id
    checkedId:{
      //选中的id
      type:String,
      observer: function (newVal, oldVal) {
        if (newVal!=this.data.id){
          this.setData({
            leftStyle: 0
          })
        }
      } 
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    leftStyle: 0,
    isShowDel: true,
    touchM:'',
    firstX: -1,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //手指刚放到屏幕触发
    touchJS: function (e) {
      // 通知其他item复位
      this.triggerEvent('restoration', this.data.currentId)
      //判断是否只有一个触摸点
      if (e.touches.length == 1 && this.data.isShowDel) {
        this.setData({
          //记录触摸起始位置的X坐标
          startX: e.touches[0].clientX,
          //记录触摸起始位置的Y坐标
          startY: e.touches[0].clientY,
          //初始化x计算起点
          firstX: -1,
          touchM: "",
          //记录初始值
          marginLeft: this.data.leftStyle,
        });
      }
    },
    //触摸时触发，手指在屏幕上每移动一次，触发一次
    touchJM: function (e) {
      // console.log("touchM:" + e);
      if (e.touches.length == 1 && this.data.isShowDel) {
        //手指移动时水平方向位置
        var moveX = e.touches[0].clientX;
        if (this.data.firstX < 0) {
          //手指移动时垂直方向位置
          var moveY = e.touches[0].clientY;
          //手指起始点位置与移动期间的差值，用于计算触发值
          var triggerX = moveX - this.data.startX;
          var triggerY = moveY - this.data.startY;
          if (Math.abs(triggerX) >= INITX && Math.abs(triggerY) < MAXY) {
            //如果还未触发过并且满足触发条件
            this.setData({
              firstX: moveX,
              touchM: "touchM"
            })
          } else {
            //如果还未触发过并且不满足触发条件
            return
          }
        }
      }
    },
    //触摸时触发，手指在屏幕上每移动一次，触发一次
    touchM: function (e) {
      // console.log("touchM:" + e);
      if (e.touches.length == 1 && this.data.isShowDel) {
        //手指移动时水平方向位置
        var moveX = e.touches[0].clientX;
        //手指触发点位置与移动期间的差值
        var disX = moveX - this.data.firstX;
        var delBtnWidth = this.data.delBtnWidth;
        var leftStyle = this.data.marginLeft;
        leftStyle = leftStyle + disX;
        //限制移动的范围
        leftStyle = Math.max(leftStyle, -delBtnWidth)
        leftStyle = Math.min(leftStyle, 0)
        this.setData({
          leftStyle
        })
      }
    },
    touchE: function (e) {
      // console.log("touchE" + e);
      if (e.changedTouches.length == 1 && this.data.firstX>=0&& this.data.isShowDel) {
        //手指移动结束后水平位置
        var endX = e.changedTouches[0].clientX;
        //触摸开始与结束，手指移动的距离
        var disX = endX - this.data.firstX;
        var delBtnWidth = this.data.delBtnWidth; 
        var leftStyle = this.data.marginLeft;
        leftStyle = leftStyle + disX;
        //限制移动的范围
        leftStyle = Math.max(leftStyle, -delBtnWidth)
        leftStyle = Math.min(leftStyle, 0)
        //如果距离小于删除按钮的1/2，不显示删除按钮
        var leftStyle = leftStyle < -delBtnWidth / 2 ? -delBtnWidth : 0;
        //更新状态
        this.setData({
          leftStyle
        });
      }
    }  
  }
})