/*
 * YUI Extensions
 * Copyright(c) 2006, Jack Slocum.
 * 
 * This code is licensed under BSD license. 
 * http://www.opensource.org/licenses/bsd-license.php
 */

/**
 * @class 
 * Makes an element resizable.
 */
YAHOO.ext.Resizable = function(el, config){
    // in case global fcn not defined
    var getEl = YAHOO.ext.Element.get;
    
    this.el = getEl(el, true);
    this.el.autoBoxAdjust = true;
    // if the element isn't positioned, make it relative
    if(this.el.getStyle('position') != 'absolute'){
        this.el.setStyle('position', 'relative');
    }
    
    // create the handles and proxy
    var dh = YAHOO.ext.DomHelper;
    var tpl = dh.createTemplate({tag: 'div', cls: 'yresizable-handle yresizable-handle-{0}', html: '&nbsp;'});
    this.east = getEl(tpl.append(this.el.dom, ['east']), true);
    this.south = getEl(tpl.append(this.el.dom, ['south']), true);
    if(config && config.multiDirectional){
        this.west = getEl(tpl.append(this.el.dom, ['west']), true);
        this.north = getEl(tpl.append(this.el.dom, ['north']), true);
    }
    this.corner = getEl(tpl.append(this.el.dom, ['southeast']), true);
    this.proxy = getEl(dh.insertBefore(document.body.firstChild, {tag: 'div', cls: 'yresizable-proxy', id: this.el.id + '-rzproxy'}), true);
    this.proxy.autoBoxAdjust = true;
    
    // wrapped event handlers to add and remove when sizing
    this.moveHandler = YAHOO.ext.EventManager.wrap(this.onMouseMove, this, true);
    this.upHandler = YAHOO.ext.EventManager.wrap(this.onMouseUp, this, true);
    this.selHandler = YAHOO.ext.EventManager.wrap(this.cancelSelection, this, true);
    
    // public events
    this.events = {
        'beforeresize' : new YAHOO.util.CustomEvent(),
        'resize' : new YAHOO.util.CustomEvent()
    };
    
    /** @private */
    this.dir = null;
    
    // properties
    this.resizeChild = false;
    this.adjustments = [0, 0];
    this.minWidth = 5;
    this.minHeight = 5;
    this.maxWidth = 10000;
    this.maxHeight = 10000;
    this.enabled = true;
    this.animate = false;
    this.duration = .35;
    this.dynamic = false;
    this.multiDirectional = false;
    this.disableTrackOver = false;
    this.easing = YAHOO.util.Easing ? YAHOO.util.Easing.easeOutStrong : null;
    
    YAHOO.ext.util.Config.apply(this, config);
    
    // listen for mouse down on the handles
    var mdown = this.onMouseDown.createDelegate(this);
    this.east.mon('mousedown', mdown);
    this.south.mon('mousedown', mdown);
    if(this.multiDirectional){
        this.west.mon('mousedown', mdown);
        this.north.mon('mousedown', mdown);
    }
    this.corner.mon('mousedown', mdown);
    
    if(!this.disableTrackOver){
        // track mouse overs
        var mover = this.onMouseOver.createDelegate(this);
        // track mouse outs
        var mout = this.onMouseOut.createDelegate(this);
        
        this.east.mon('mouseover', mover);
        this.east.mon('mouseout', mout);
        this.south.mon('mouseover', mover);
        this.south.mon('mouseout', mout);
        if(this.multiDirectional){
            this.west.mon('mouseover', mover);
            this.west.mon('mouseout', mout);
            this.north.mon('mouseover', mover);
            this.north.mon('mouseout', mout);
        }
        this.corner.mon('mouseover', mover);
        this.corner.mon('mouseout', mout);
    }
    this.updateChildSize();
};

YAHOO.extendX(YAHOO.ext.Resizable, YAHOO.ext.util.Observable, {
    resizeTo : function(width, height){
        this.el.setSize(width, height);
        this.fireEvent('resize', this, width, height, null);
    },
    
    cancelSelection : function(e){
        e.preventDefault();
    },
    
    startSizing : function(e){
        this.fireEvent('beforeresize', this, e);
        if(this.enabled){ // 2nd enabled check in case disabled before beforeresize handler
            e.preventDefault();
            this.startBox = this.el.getBox();
            this.startPoint = e.getXY();
            this.offsets = [(this.startBox.x + this.startBox.width) - this.startPoint[0],
                            (this.startBox.y + this.startBox.height) - this.startPoint[1]];
            this.proxy.setBox(this.startBox);
            if(!this.dynamic){
                this.proxy.show();
            }
            YAHOO.util.Event.on(document.body, 'selectstart', this.selHandler);
            YAHOO.util.Event.on(document.body, 'mousemove', this.moveHandler);
            YAHOO.util.Event.on(document.body, 'mouseup', this.upHandler);
        }
    },
    
    onMouseDown : function(e){
        if(this.enabled){
            var t = e.getTarget();
            if(t == this.corner.dom){
                this.dir = 'both';
                this.proxy.setStyle('cursor', this.corner.getStyle('cursor'));
                this.startSizing(e);
            }else if(t == this.east.dom){
                this.dir = 'east';
                this.proxy.setStyle('cursor', this.east.getStyle('cursor'));
                this.startSizing(e);
            }else if(t == this.south.dom){
                this.dir = 'south';
                this.proxy.setStyle('cursor', this.south.getStyle('cursor'));
                this.startSizing(e);
            }else if(t == this.west.dom){
                this.dir = 'west';
                this.proxy.setStyle('cursor', this.west.getStyle('cursor'));
                this.startSizing(e);
            }else if(t == this.north.dom){
                this.dir = 'north';
                this.proxy.setStyle('cursor', this.north.getStyle('cursor'));
                this.startSizing(e);
            }
        }          
    },
    
    onMouseUp : function(e){
        YAHOO.util.Event.removeListener(document.body, 'selectstart', this.selHandler);
        YAHOO.util.Event.removeListener(document.body, 'mousemove', this.moveHandler);
        YAHOO.util.Event.removeListener(document.body, 'mouseup', this.upHandler);
        var size = this.resizeElement();
        this.fireEvent('resize', this, size.width, size.height, e);
    },
    
    updateChildSize : function(){
        if(this.resizeChild && this.el.dom.firstChild && this.el.dom.offsetWidth){
            var el = this.el;
            var adj = this.adjustments;
            setTimeout(function(){
                var c = YAHOO.ext.Element.get(el.dom.firstChild, true);
                var b = el.getBox(true);
                c.setSize(b.width+adj[0], b.height+adj[1]);
            }, 1);
        }
    },
    
    resizeElement : function(){
        var box = this.proxy.getBox();
        this.el.setBox(box, false, this.animate, this.duration, null, this.easing);
        this.updateChildSize();
        this.proxy.hide();
        return box;
    },
    
    onMouseMove : function(e){
        if(this.enabled){
            var xy = e.getXY();
            if(this.dir == 'both' || this.dir == 'east' || this.dir == 'south'){
                var w = Math.min(Math.max(this.minWidth, xy[0]-this.startBox.x+this.offsets[0]),this.maxWidth);
                var h = Math.min(Math.max(this.minHeight, xy[1]-this.startBox.y+this.offsets[1]), this.maxHeight);
                if(this.dir == 'both'){
                    this.proxy.setSize(w, h);
                }else if(this.dir == 'east'){
                    this.proxy.setWidth(w);
                }else if(this.dir == 'south'){
                    this.proxy.setHeight(h);
                }
            }else{
                var x = this.startBox.x + (xy[0]-this.startPoint[0]);
                var y = this.startBox.y + (xy[1]-this.startPoint[1]);
                var w = this.startBox.width+(this.startBox.x-x);
                var h = this.startBox.height+(this.startBox.y-y);
                if(this.dir == 'west' && w <= this.maxWidth && w >= this.minWidth){
                    this.proxy.setX(x);
                    this.proxy.setWidth(w);
                }else if(this.dir == 'north' && h <= this.maxHeight && h >= this.minHeight){
                    this.proxy.setY(y);
                    this.proxy.setHeight(h);
                }
            }
            if(this.dynamic){
                this.resizeElement();
            }
        }
    },
    
    onMouseOver : function(){
        if(this.enabled) this.el.addClass('yresizable-over');
    },
    
    onMouseOut : function(){
        this.el.removeClass('yresizable-over');
    }
});