/*
 * Created with
 * User: 田想兵
 * Date: 2015-03-16
 * Time: 20:27:54
 * Contact: 55342775@qq.com
 * 
 * modified by Garbol.Wu
 */
;
(function(root, factory) {
    //amd
    if (typeof define === 'function' && define.amd) {
        define(['$'], factory);
    } else if (typeof exports === 'object') { //umd
        module.exports = factory();
    } else {
        root.Dialog = factory(window.Zepto || window.jQuery || $);
    }
})(this, function($) {
    $.fn.Dialog = function(settings) {
        var list = [];
        $(this).each(function() {
            var dialog = new Dialog();
            var options = $.extend({
                trigger: $(this)
            }, settings);
            dialog.init(options);
            list.push(dialog);
        });
        return list;
    };
    $.Dialog = function(settings) {
        if (settings.type === "alert") {
            var alert = new Dialog();
            var html = '<div class="ui-alert-title">' + settings.content + '</div>';
            var action = '';
            if (settings.button) {
                if (typeof settings.button == 'boolean') {
                    settings.button = '确定';
                };
                action = '<p class="ui-dialog-action"><button class="ui-alert-submit  js-dialog-close">' + settings.button + '</button></p>';
            } else if (!settings.timer) {
                settings.timer = 3000;
            }
            html += action;
            var alertOptions = $.extend({
                target: html,
                animate: true,
                showType: "zoomIn",
                show: true,
                mask: true,
                className: "ui-alert",
                afterHide: function(c) {
                    this.dispose();
                    settings.callback && settings.callback();
                }
            }, settings);
            alert.init(alertOptions);
            if (settings.timer) {
                setTimeout(function() {
                    alert.dispose();
                    settings.callback && settings.callback();
                }, settings.timer);
            }
            alert.touch(alert.mask, function() {
                alert.hide();
                settings.callback && settings.callback();
            });
        }
        if (settings.type === "confirm") {
            var dialog = new Dialog();
            var html = '<div class="ui-confirm-title">' + settings.content + '</div>';
            var action = '';
            if (!settings.buttons) {
                settings.buttons = [{
                    'no': '取消'
                }, {
                    'yes': '确定'
                }];
            };
            var btnstr = '';
            for (var i = 0, l = settings.buttons.length; i < l; i++) {
                var item = settings.buttons[i];
                if (item.yes) {
                    btnstr += '<td align="right"><button class="ui-confirm-submit " data-type="yes">' + item.yes + '</button></td>';
                }
                if (item.no) {
                    btnstr += '<td align="left"><button class="ui-confirm-no" data-type="no">' + item.no + '</button></td>';
                }
                if (item.close) {
                    btnstr += '<td><button class="ui-confirm-close js-dialog-close" data-type="close">' + item.close + '</button></td>';
                }
            }
            action = '<table class="ui-dialog-action"><tr>' + btnstr + '</tr></table>';
            html = action + html;
            var options = $.extend({
                target: html,
                animate: true,
                showType: "zoomIn",
                show: true,
                fixed:true,
                mask: true,
                // className: "ui-alert",
                className: "",
                afterHide: function(c) {
                    this.dispose();
                },
                beforeShow: function(c) {
                    dialog.touch($('.ui-confirm-submit', c), function() {
                        settings.callback && settings.callback.call(dialog, 'yes', c);
                    });
                    dialog.touch($('.ui-confirm-no', c), function() {
                        settings.callback && settings.callback.call(dialog, 'no', c);
                    });
                    dialog.touch($('.ui-confirm-close', c), function() {
                        settings.callback && settings.callback.call(dialog, 'close', c);
                    });
                }
            }, settings);
            dialog.init(options);
        }
    };
    /*alert*/
    $.alert = function(content, button, callback, timer, settings) {
            var options = {};
            var defaults = {
                zIndex: 100,
                type: 'alert'
            };
            if (typeof content == 'object') {
                options = $.extend(defaults, content);
            } else {
                options = $.extend(defaults, {
                    content: content,
                    button: button,
                    timer: timer,
                    callback: callback
                });
            }
            $.Dialog($.extend(options, settings));
        }
        /*
        buttons :[{yes:"确定"},{no:'取消'},{close:'关闭'}]
        */
    $.confirm = function(content, buttons, callback, settings) {
        var options = {};
        var defaults = {
            zIndex: 100,
            type: 'confirm'
        };
        if (typeof content == 'object') {
            options = $.extend(defaults, content);
        } else {
            options = $.extend(defaults, {
                content: content,
                buttons: buttons,
                callback: callback
            });
        }
        $.Dialog($.extend(options, settings));
    }
    var Dialog = function() {
        var rnd = Math.random().toString().replace('.', '');
        this.id = 'dialog_' + rnd;
        this.settings = {};
        this.settings.closeTpl = $('<span class="ui-dialog-close js-dialog-close">x</span>');
        this.settings.titleTpl = $('<div class="ui-dialog-title"></div>');
        this.timer = null;
        this.showed = false;
        this.mask = $();
    }
    Dialog.prototype = {
        init: function(settings) {
            var _this = this;
            this.settings = $.extend({
                fixed: false//是否固定位置，
            }, this.settings, settings);
            if (this.settings.mask) {
                this.mask = $('<div class="ui-dialog-mask"/>');
                $('body').append(this.mask);
            }
            $('body').append('<div class="ui-dialog" id="' + this.id + '"></div>');
            this.dialogContainer = $('#' + this.id);
            var zIndex = this.settings.zIndex || 10;
            this.dialogContainer.css({
                'zIndex': zIndex
            });
            if (this.settings.className) {
                this.dialogContainer.addClass(this.settings.className);
            };
            this.mask.css({
                'zIndex': zIndex - 1
            });
            // if (this.settings.closeTpl) {
            //     this.dialogContainer.append(this.settings.closeTpl);
            // }
            if (this.settings.title) {
                this.dialogContainer.append(this.settings.titleTpl);
                this.settings.titleTpl.html(this.settings.title);
            }
            this.bindEvent();
            if (this.settings.show) {
                this.show();
            }
        },
        touch: function(obj, fn) {
            var move;
            $(obj).on('touchend', click);

            function click(e) {
                return fn.call(this, e);
            }
            $(obj).on('touchmove', function(e) {
                move = true;
            }).on('touchend', function(e) {
                e.preventDefault();
                if (!move) {
                    var returnvalue = fn.call(this, e, 'touch');
                    if (!returnvalue) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
                move = false;
            });
        },
        bindEvent: function() {
            var _this = this;
            if (this.settings.trigger) {
                $(this.settings.trigger).click(function() {
                    _this.show()
                });
                _this.touch($(this.settings.trigger), function() {
                    _this.show()
                });
            };
            $(this.dialogContainer).on('click', '.js-dialog-close', function() {
                _this.hide();
                return false;
            })
                // $(window).resize(function() {
                //  _this.setPosition();
                // });
                // $(window).scroll(function() {
                //  _this.setPosition();
                // })
            $(document).keydown(function(e) {
                if (e.keyCode === 27 && _this.showed) {
                    _this.hide();
                }
            });
            $(this.dialogContainer).on('hide', function() {
                _this.hide();
            })
        },
        dispose: function() {
            this.dialogContainer.remove();
            this.mask.remove();
            this.timer && clearInterval(this.timer);
        },
        hide: function() {
            var _this = this;
            if (_this.settings.beforeHide) {
                _this.settings.beforeHide.call(_this, _this.dialogContainer);
            }
            this.showed = false;
            this.mask.hide();
            this.timer && clearInterval(this.timer);
            if (this.settings.animate) {
                if(this.settings.showType == "zoomIn") {
                    this.dialogContainer.removeClass('zoomIn').addClass("zoomOut");
                    setTimeout(function() {
                        _this.dialogContainer.hide();
                        if (typeof _this.settings.target === "object") {
                            $('body').append(_this.dialogContainer.hide());
                        }
                        if (_this.settings.afterHide) {
                            _this.settings.afterHide.call(_this, _this.dialogContainer);
                        }
                    }, 500);
                }else if(this.settings.showType == "easingIn") {
                    this.dialogContainer.animate({
                        bottom: -(this.dialogContainer.outerHeight())
                    }, 500, function(){
                        setTimeout(function() {
                            _this.dialogContainer.hide();
                            if (typeof _this.settings.target === "object") {
                                $('body').append(_this.dialogContainer.hide());
                            }
                            if (_this.settings.afterHide) {
                                _this.settings.afterHide.call(_this, _this.dialogContainer);
                            }
                        }, 500);
                    });
                }
            } else {
                this.dialogContainer.hide();
                if (typeof this.settings.target === "object") {
                    $('body').append(this.dialogContainer)
                }
                if (this.settings.afterHide) {
                    this.settings.afterHide.call(this, this.dialogContainer);
                }
            }
        },
        show: function() {
            if (typeof this.settings.target === "string") {
                if (/^(\.|\#\w+)/gi.test(this.settings.target)) {
                    this.dailogContent = $(this.settings.target);
                } else {
                    this.dailogContent = $('<div>' + this.settings.target + '</div>')
                }
            } else {
                this.dailogContent = this.settings.target;
            }
            this.mask.show();
            this.dailogContent.show();
            this.height = this.settings.height || 'auto' //this.dialogContainer.height();
            this.width = this.settings.width || 'auto' //this.dialogContainer.width();
            this.dialogContainer.append(this.dailogContent).show().css({
                height: this.height,
                width: this.width
            });
            if (this.settings.beforeShow) {
                this.settings.beforeShow.call(this, this.dialogContainer);
            }
            this.showed = true;
            $(this.settings.trigger).blur();

            this.setPosition();
            var _this = this;
            // $.alert(this.settings.clientWidth)
            this.timer && clearInterval(this.timer);
            if (this.settings.fixed) {
                // this.timer = setInterval(function() {
                //  _this.setPosition();
                // }, 1000);
            }
            if (this.settings.animate) {
                if(this.settings.showType == "zoomIn") {
                    this.dialogContainer.addClass('zoomIn').removeClass('zoomOut').addClass('animated');
                }else if(this.settings.showType == "easingIn") {
                    this.dialogContainer.css("bottom", -(this.dialogContainer.outerHeight())).animate({
                        bottom: 0
                    }, 300, function(){});
                }
            }
        },
        setPosition: function() {
            if (this.showed) {
                var _this = this;
                this.dialogContainer.show();
                this.height = this.settings.height;
                this.width = this.settings.width;
                if (isNaN(this.height)) {
                    this.height = (this.dialogContainer.outerHeight && this.dialogContainer.outerHeight()) || this.dialogContainer.height();
                }
                if (isNaN(this.width)) {
                    this.width = (this.dialogContainer.outerWidth && this.dialogContainer.outerWidth()) || this.dialogContainer.width();
                }
                var clientHeight = this.settings.clientHeight || document.documentElement.clientHeight || document.body.clientHeight;
                var clientWidth = this.settings.clientWidth || document.documentElement.clientWidth || document.body.clientWidth;
                var ml = this.width / 2;
                var mt = this.height / 2;
                // modify by Garbol.Wu
                var left = 0;
                if(this.settings.type == 'alert') {
                    var left = clientWidth / 2 - ml;
                }
                var bottom = 0;
                
                var top = clientHeight / 2 - mt;
                left = Math.floor(Math.max(0, left));
                top = Math.floor(Math.max(0, top));
                var position = 'absolute';
                if(_this.settings.fixed){
                    position='fixed';
                }
                if(this.settings.type == 'alert') {
                    _this.dialogContainer.css({
                        position: position,
                        top: top,
                        // bottom: bottom,
                        left: left
                    });
                }else{
                    _this.dialogContainer.css({
                        position: position,
                        // top: top,
                        bottom: bottom,
                        left: left
                    });
                }
            }
        }
    }
    return Dialog;
});



;
(function(root, factory) {
    //amd
    if (typeof define === 'function' && define.amd) {
        define(['$', 'dialog'], factory);
    }else if (typeof define === 'function' && define.cmd) {
        define(function(require, exports, module) {
            var $ = require("$");
            var Dialog=require("dialog");
            return factory($,Dialog);
        });
    }  else if (typeof exports === 'object') { //umd
        module.exports = factory();
    } else {
        root.MobileSelectArea = factory(window.Zepto || window.jQuery || $);
    }
})(this, function($, Dialog) {
    var MobileSelectArea = function() {
        var rnd = Math.random().toString().replace('.', '');
        this.id = 'scroller_' + rnd;
        this.scroller;
        this.data;
        this.index = 0;
        this.value = [0, 0, 0];
        this.oldvalue;
        this.oldtext=[];
        this.text = ['', '', ''];
        this.level = 3;
        this.mtop = 35;
        this.separator = ' ';
    };
    MobileSelectArea.prototype = {
        init: function(settings) {
            this.settings = $.extend({
                // 弃用click，是由于移动端如果同时存在click、touch事件时，低版本安卓系统会出现事件穿透现象
                eventName: 'touchstart'
            }, settings);
            this.trigger = $(this.settings.trigger);
            this.settings.default == undefined ? this.default = 1 : this.default = this.settings.default; //0为空,1时默认选中第一项
            level = parseInt(this.settings.level);
            this.level = level > 0 ? level : 3;
            this.trigger.attr("readonly", "readonly");
            this.value = (this.settings.value && this.settings.value.split(",")) || [0, 0, 0];
            this.text = (this.settings.text && this.settings.text.split(' ')) || ['', '', ''];
            this.oldvalue = this.value.concat([]);
            this.oldtext = this.text.concat([]);
            this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            this.clientWidth = document.documentElement.clientWidth || document.body.clientWidth;
            // this.promise = this.getData();
            this.bindEvent();
        },
        getData: function() {
            var _this = this;
            var dtd = $.Deferred();
            if (typeof this.settings.data == "object") {
                this.data = this.settings.data;
                dtd.resolve();
            } else {
                $.ajax({
                    dataType: 'json',
                    cache: true,
                    url: this.settings.data,
                    type: 'GET',
                    success: function(result) {
                        _this.data = result.data;
                        dtd.resolve();
                    },
                    accepts: {
                        json: "application/json, text/javascript, */*; q=0.01"
                    }
                });
            }
            return dtd;
        },
        bindEvent: function() {
            var _this = this;
            // this.trigger[_this.settings.eventName](function(e) {
            $(this.trigger).on(_this.settings.eventName, function(e) {

                // 手动置空页面的焦点，防止出现输入框和组件同时处于焦点状态
                $(':focus').blur();

                var dlgContent = '',
                    w = 100/_this.level;
                for (var i = 0; i < _this.level; i++) {
                    dlgContent += '<div style="width:'+w+'%;"></div>';
                };
                $.confirm('<div class="ui-scroller-mask"><div id="' + _this.id + '" class="ui-scroller">' + dlgContent + '<p></p></div></div>', null, function(t, c) {
                    if (t == "yes") {
                        _this.submit()
                    }
                    if (t == 'no') {
                        _this.cancel();
                    }
                    this.dispose();
                }, {
                    showType: _this.settings.showType,
                    width: '100%',
                    // height: 215
                });
                _this.scroller = $('#' + _this.id);
                _this.getData().done(function() {
                    _this.format();
                });
                var start = 0,
                    end = 0
                _this.scroller.children().bind('touchstart', function(e) {
                    start = (e.changedTouches || e.originalEvent.changedTouches)[0].pageY;
                });
                _this.scroller.children().bind('touchmove', function(e) {
                    end = (e.changedTouches || e.originalEvent.changedTouches)[0].pageY;
                    var diff = end - start;
                    var dl = $(e.target).parent();
                    if (dl[0].nodeName != "DL") {
                        return;
                    }
                    var top = parseInt(dl.css('top') || 0) + diff;
                    dl.css('top', top);
                    start = end;
                    return false;
                });
                _this.scroller.children().bind('touchend', function(e) {
                    end = (e.changedTouches || e.originalEvent.changedTouches)[0].pageY;
                    var diff = end - start;
                    var dl = $(e.target).parent();
                    var dlParent = dl.parent();
                    if (dl[0].nodeName != "DL") {
                        return;
                    }
                    var i = $(dl.parent()).index();
                    var top = parseInt(dl.css('top') || 0) + diff;
                    // _this.mtop = $(dl.children().get(0)).outerHeight();
                    var $dd = $(dl).children().get(0);
                    _this.mtop = parseFloat(window.getComputedStyle($dd)['padding-top']) + parseFloat(window.getComputedStyle($dd)['height']) + parseFloat(window.getComputedStyle($dd)['padding-bottom']);
            
                    if (top > _this.mtop) {
                        top = _this.mtop;
                    }
                    if (top < -$(dl).height() + 80) {
                        top = -$(dl).height() + 80;
                    }
                    var mod = top / _this.mtop;
                    var mode = Math.round(mod);
                    var index = Math.abs(mode) + 1;
                    if (mode == 1) {
                        index = 0;
                    }else if(index >= dl.children().length) {
                        index = dl.children().length - 1;
                    }
                    _this.value[i] = $(dl.children().get(index)).attr('ref');
                    _this.value[i] == 0 ? _this.text[i] = "" : _this.text[i] = $(dl.children().get(index)).html();
                    for (var j = _this.level - 1; j > i; j--) {
                        _this.value[j] = 0;
                        _this.text[j] = "";
                    }
                    if (!$(dl.children().get(index)).hasClass('focus')) {
                        _this.format();
                    }
                    dl = dlParent.children('dl');
                    $(dl.children().get(index)).addClass('focus').siblings().removeClass('focus');
                    dl.css('top', mode * _this.mtop);
                    return false;
                });
                return false;
            });
        },
        format: function() {
            var _this = this;
            var child = _this.scroller.children();
            this.f(this.data);
            console.log(_this.text)
        },
        f: function(data) {
            var _this = this;
            var item = data;
            if (!item) {
                item = [];
            };
            var child = _this.scroller.children();

            // 添置一个空元素，用于提前计算滚动向下的偏移量
            $(child[_this.index]).html("<dl><dd>啊</dd></dl>");
            // _this.mtop = $($(child[_this.index]).children().get(0)).outerHeight();
            var $dd = $(child[_this.index]).children().get(0);
            _this.mtop = parseFloat(window.getComputedStyle($dd)['padding-top']) + parseFloat(window.getComputedStyle($dd)['height']) + parseFloat(window.getComputedStyle($dd)['padding-bottom']);

            var str = '<dl><dd ref="0">——</dd>';
            var focus = 0,
                childData, top = _this.mtop;
            if (_this.index !== 0 && _this.value[_this.index - 1] == "0" && this.default == 0) {
                str = '<dl><dd ref="0" class="focus">——</dd>';
                _this.value[_this.index] = 0;
                _this.text[_this.index] = "";
                focus = 0;
            } else {
                if (_this.value[_this.index] == "0") {
                    str = '<dl><dd ref="0" class="focus">——</dd>';
                    focus = 0;
                }
                if (item.length > 0 && this.default == 1) {
                    str = '<dl>';
                    var pid = item[0].pid || 0;
                    var id = item[0].id || 0;
                    focus = item[0].id;
                    childData = item[0].child;
                    var cls = "";
                    if (!_this.value[this.index]) {
                        _this.value[this.index] = id;
                        _this.text[this.index] = item[0].name;
                    }
                    if(_this.value[this.index] == id) {
                        cls = "focus";
                    }
                    str += '<dd pid="' + pid + '" class="' + cls + '" ref="' + id + '">' + item[0].name + '</dd>';
                }
                for (var j = _this.default, len = item.length; j < len; j++) {
                    var pid = item[j].pid || 0;
                    var id = item[j].id || 0;
                    var cls = '';
                    if (_this.value[_this.index] == id) {
                        cls = "focus";
                        focus = id;
                        childData = item[j].child;
                        top = _this.mtop * (-(j - _this.default));
                    };
                    str += '<dd pid="' + pid + '" class="' + cls + '" ref="' + id + '">' + item[j].name + '</dd>';
                }
            }
            str += "</dl>";
            var newdom = $(str);
            newdom.css('top', top);
            $(child[_this.index]).html(newdom);
            _this.index++;
            if (_this.index > _this.level - 1) {
                _this.index = 0;
                return;
            }
            _this.f(childData);
        },
        submit: function() {
            this.oldvalue = this.value.concat([]);
            this.oldtext = this.text.concat([]);
            if (this.trigger[0].nodeType == 1) {
                if(this.trigger[0].tagName == "INPUT" || this.trigger[0].tagName == "TEXTAREA") {
                    // input、textarea
                    this.trigger.val(this.text.join(this.separator));
                }else{
                    // 非输入标签则设置为内联文本
                    this.trigger.text(this.text.join(this.separator));
                }
                this.trigger.attr('data-value', this.value.join(',')).addClass('has-val');
            }
            this.trigger.next(':hidden').val(this.value.join(','));
            this.settings.callback && this.settings.callback.call(this, this.scroller, this.text, this.value);
        },
        cancel: function() {
            this.value = this.oldvalue.concat([]);
            this.text = this.oldtext.concat([]);
        }
    };
    return MobileSelectArea;
});