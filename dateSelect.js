// pages/dateSelect/dateSelect.js

var Moment = require("../../utils/Moment.js");

var DATE_LIST = [];
var DATE_YEAR = new Date().getFullYear()
var DATE_MONTH = new Date().getMonth()+1
var DATE_DAY = new Date().getDate()

Page({
  data:{
    maxMonth:3, //最多渲染月数
    dateList:[],
    systemInfo:{},

    weekStr:['日','一','二','三','四','五','六'],
    checkInDate:Moment(new Date()).format('YYYY-MM-DD'),
    checkOutDate:Moment(new Date()).add(1,'day').format('YYYY-MM-DD'),
    markcheckInDate:false, //标记开始时间是否已经选择
    markcheckOutDate:false   //标记结束时间是否已经选择
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    this.createDateListData();
    var _this = this;
    // 页面初始化 options为页面跳转所带来的参数

    var checkInDate = options.checkInDate?options.checkInDate:Moment(new Date()).format('YYYY-MM-DD');
    var checkOutDate = options.checkOutDate?options.checkOutDate:Moment(new Date()).add(1,'day').format('YYYY-MM-DD');

    wx.getSystemInfo({
      success: function(res) {
        _this.setData({systemInfo:res,checkInDate:checkInDate,checkOutDate:checkOutDate});
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  createDateListData:function(){
    var dateList = [];
    var now = new Date();
    /*
      设置日期为 年-月-01,否则可能会出现跨月的问题
      比如：2017-01-31为now ,月份直接+1（now.setMonth(now.getMonth()+1)），则会直接跳到跳到2017-03-03月份.
        原因是由于2月份没有31号，顺推下去变成了了03-03
    */
    now = new Date(now.getFullYear(),now.getMonth(),1);
    for(var i=0;i<this.data.maxMonth;i++){
      var momentDate = Moment(now).add(this.data.maxMonth-(this.data.maxMonth-i),'month').date;
      var year = momentDate.getFullYear();
      var month = momentDate.getMonth()+1;

      var days = [];
      var totalDay = this.getTotalDayByMonth(year,month);
      var week = this.getWeek(year,month,1);
      //-week是为了使当月第一天的日期可以正确的显示到对应的周几位置上，比如星期三(week = 2)，
      //则当月的1号是从列的第三个位置开始渲染的，前面会占用-2，-1，0的位置,从1开正常渲染
      for(var j = -week+1;j<=totalDay;j++){
          var tempWeek = -1;
          if(j>0)
             tempWeek = this.getWeek(year,month,j);
          var clazz = '';
          if(tempWeek == 0 || tempWeek == 6)
              clazz = 'week'
          if(j<DATE_DAY && year == DATE_YEAR && month == DATE_MONTH)
              //当天之前的日期不可用
              clazz = 'unavailable '+clazz;
          else
              clazz = 'nostate '+clazz
          days.push({day:j,class:clazz})
      }
      var dateItem = {
        id:year+'-'+month,
        year:year,
        month:month,
        days:days
      }

      dateList.push(dateItem);
    }
    this.setData({
      dateList:dateList
    });
    DATE_LIST = dateList;
  },
  /*
	 * 获取月的总天数
	 */
	getTotalDayByMonth:function(year,month){
		month=parseInt(month,10);
		var d=new Date(year,month,0);
		return d.getDate();
	},
	/*
	 * 获取月的第一天是星期几
	 */
	getWeek:function(year,month,day){
		var d=new Date(year,month-1,day);
		return d.getDay();
	},
  /**
   * 点击日期事件
   */
  onPressDate:function(e){
    var {year,month,day} = e.target.dataset;

    //当前选择的日期为同一个月并小于今天，或者点击了空白处（即day<0），不执行
    if((day<DATE_DAY && month == DATE_MONTH) || day<=0) return;

    var tempMonth = month;
    var tempDay = day;

    if(month<10) tempMonth='0'+month
    if(day <10) tempDay= '0'+day

    var date = year+'-'+tempMonth+'-'+tempDay;

    //如果点击选择的日期A小于入住时间，则重新渲染入住时间为A
    if((this.data.markcheckInDate && Moment(date).before(this.data.checkInDate)||this.data.checkInDate === date)){
        this.setData({
          markcheckInDate:false,
          markcheckOutDate:false,
          dateList:DATE_LIST.concat()
        });
    };

    if(!this.data.markcheckInDate){
      this.setData({
        checkInDate:date,
        markcheckInDate:true,
      });
    }else if(!this.data.markcheckOutDate){
      this.setData({
        checkOutDate:date,
        markcheckOutDate:true,
      });
      //设缓存，返回页面时，可在onShow时获取缓存起来的日期
      wx.setStorage({
        key:'ROOM_SOURCE_DATE',
        data:{
          checkInDate:this.data.checkInDate,
          checkOutDate:this.data.checkOutDate
        }
      });
      wx.navigateBack({
        delta: 1, // 回退前 delta(默认为1) 页面
      });
    }
    
    this.renderPressStyle(year,month,day);
  },
  renderPressStyle:function(year,month,day){
      var dateList = this.data.dateList;
      //渲染点击样式
      for(var i=0;i<dateList.length;i++){
        var dateItem = dateList[i];
        var id = dateItem.id;
        if(id === year+'-'+month){
          var days = dateItem.days;
          for(var j=0;j<days.length;j++){
            var tempDay = days[j].day;
            if(tempDay == day){
              days[j].class = days[j].class+' active';
              break;
            }
          }
          break;
        }
      }
      this.setData({
          dateList:dateList
      });
  }
})