# left-del-item
一个左滑删除实现，解决了滑动冲突。
小程序之左滑删除
-解决滑动冲突
跟大家分享一个原创的解决方案，由同事崇森和本人共同设计，而后本人将其完善并抽象成组件的左滑删除控件。该方案主要优点在于解决了左滑删除主要运用场景-列表中、垂直滑动与水平滑动互相干扰的问题，主要用到的知识是小程序中的事件传递，目前运用到的项目是“洗衣大师”。
主要的目录结构分成三部分，index是需要使用到左滑删除功能的界面，在demo中主要包含一个列表的展示和删除功能；left-del-item则是经过抽象左滑删除组件；left-del-item中开放两部分可自定义布局——常规状态下可视区域和左滑出来后可视的删除按钮，由于删除按钮比较简单，通常情况下也没有复杂交互，所以就不单独封装成组件，而item则是常规可视区域的业务组件。


<import src="../template/template.wxml" />
<view style='display:flex;flex-direction:column;justify-content:center;align-items:center;'>
  <view wx:for="{{list}}" wx:for-index="index" wx:for-item="item" wx:key="item">
    <left-del-item bindrestoration='restoration' currentId='{{item.contentId}}' delBtnWidth='328'checkedId='{{checkedId}}'>
      <view slot="content">
        <item item='{{item}}' bindclick='itemClick' />
      </view>
      <view slot="del">
        <button class='del' bindtap='delClick' data-item='{{item}}'>删除</button>
      </view>
    </left-del-item>
  </view>
</view>



看到index.wxml中的布局，可以看到就是一个以left-del-item为模板的列表渲染，其实名为content以及del的slot就是组件开放的抽象节点，用于接收自定义布局。由于常规可视区域的业务场景更为复杂，所以在此处传入一个业务组件，更切合常规开放过程；而删除按钮显然只需要一个点击事件，所以在这里用template引用，当然你也可以在“del”slot下直接编写布局代码。

接着我们介绍一下小程序的事件传递，虽然官方文档没有明说，但是根据给出的规则，我们不难得出，小程序的事件传递跟android的原理上是很相似的，都是从顶层view传递到底层然后再传回来，在这个过程随时可以截取事件并决定是否消耗到该次事件，即不继续沿着原有轨迹继续传递。
令人感到为难的是，决定是否消耗事件的关键并不能动态改变，而是通过bind或者catch的属性来设置，而处理滑动冲突无非就是在合适的时候分配事件给合适的view，并且不让不该得到事件的view得到事件。如果不能动态改变是否截取事件。


<view class='parent-layout' style='margin-left:{{leftStyle}}rpx;margin-bottom:{{length==index+1?20:0}}rpx;'>
  <view class='item-content' bind:touchstart="touchJS" bind:touchmove="touchJM">
    <view class='item-content' catch:touchmove="{{touchM}}" bind:touchend="touchE">
      <slot name="content"></slot>
    </view>
  </view>
  <view class='item-del'>
    <slot name="del"></slot>
  </view>
</view>



既然bind和catch不能灵活改变，那我们就改变可以改变的东西——也就是left-del-item.wxml中变量{{touchM}}。
一开始我们试验bind事件和catch事件同时存在的情况，是否能通过顺序或者其他的去控制是否消耗事件，发现规律混乱，但是意外发现当接收事件的函数名为空时，该事件不起作用，也就是说可以控制图中划线这个属性值，从而控制左滑的move事件是否起作用。也就是说有一个开关的作用，而当其起作用时，由于使用的是catch，上层view的列表就无法接收到move事件，从而起到不让列表滑动的作用，至此，解决了水平的左滑删除和垂直的列表滚动的冲突，让二者达成互斥的条件。
但是仅此是不够的，有了开关我们还需要控制开关。
也就是界定清楚什么时候是纵向滑动，什么时候的横向滑动，我们让变量{{touchM}}的初始值为空，当达到临界条件时，接管滑动事件，所以我们还需要监听move，并且在里面定制临街条件的规则。
所以这里做的是两层包裹，上层的move使用bind的不消耗事件并且专注于监听达到临界值时切换两种滑动方式。这个做法也不是一开始就这样的，最初的方案是在列表中去做这个判断，代码耦合十分严重，后来转念一想才使用两层包裹的做法，而一开始的弯路也是受android开发的影响太深。
你可能会注意到这里的两个solt，没错，上面接收的节点正是在此处开放的。


上图中包含了四个方法，分别是外层的“touchstart”、“touchmove”以及内层的“touchmove”、“touchend”。
下面我们到left-del-item.js中分析一下这四个方法：


外层的“touchstart”：

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


当手指接触到一个新的item也就是当前item时，我们要通知其他item，如果存在已经左滑出来的情况要复位；
然后满足单点触碰以及开发者是否希望提供该功能（isShowDel），接着记录初始坐标以及当满足水平滑动条件时要用到的初始点firstX（当firstX>=0时，说明满足左滑条件），初始化为-1，是为了复位上次操作的旧数据，保证默认垂直滑动；touchM是指定内层move事件，默认为空；
marginLeft是记录一开始左滑的距离，一般来说，只有0和完全滑出两个状态。


外层的“touchmove”：

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



在这里我们定制切换成水平滑动的规则，具体的规则是当垂直距离小于某个值而水平距离大于某个值时，我们判断其操作是左滑，此时记录firstX值便于下一步计算，并且赋值给下层的move事件，当下层的catch:touchmove有值时，不但上层的列表滑动会被屏蔽，当前用于判断是否开启水平滑动的move事件也会被屏蔽。


内层的“touchmove”：


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



到了真正控制水平滑动的代码反而很简单，就是计算手指水平的滑动距离，然后实时更新到left-del-item顶层view的左边距就可以了，需要注意的是，要严格控制上下限，即滑动最大距离不能超过删除按钮部分的距离delBtnWidth，最小距离只能是0。

内层的“touchend”：

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

这里主要用于滑动过程中突然放手的情况，目前的逻辑是，当滑动超过一半距离就接着完成，否则就复位。

以上，就是关于左滑删除-解决滑动冲突的原创解决方案。
思考：
1、开头我们说到事件传递是从顶层view到底层view然后再传递回去的，那为什么我们这里用的都是冒泡事件而不是捕获事件呢？
事实上我们要封装的是一个子view，也就是说我们要将开关放在底层view，而底层view能控制顶层的就是冒泡事件。
2、这套方案能实现，得益于列表冒泡事件的move被屏蔽时就不能滑动了，这是不是也说明了列表滑动的系统实现是放在冒泡事件而不是捕获事件的呢？
