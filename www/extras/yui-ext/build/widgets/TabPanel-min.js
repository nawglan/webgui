/*
 * YUI Extensions
 * Copyright(c) 2006, Jack Slocum.
 * 
 * This code is licensed under BSD license. 
 * http://www.opensource.org/licenses/bsd-license.php
 */


YAHOO.ext.TabPanel=function(container,onBottom){this.el=getEl(container);if(onBottom){this.bodyEl=getEl(this.createBody(this.el.dom));this.el.addClass('ytabs-bottom');}
this.stripWrap=getEl(this.createStrip(this.el.dom));this.stripEl=getEl(this.createStripList(this.stripWrap.dom));if(!onBottom){this.bodyEl=getEl(this.createBody(this.el.dom));}
this.items={};this.active=null;this.onTabChange=new YAHOO.util.CustomEvent('TabItem.onTabChange');this.activateDelegate=this.activate.createDelegate(this);}
YAHOO.ext.TabPanel.prototype={addTab:function(id,text,content){var item=new YAHOO.ext.TabPanelItem(this,id,text);this.addTabItem(item);if(content){item.setContent(content);}
return item;},getTab:function(id){return this.items[id];},addTabItem:function(item){this.items[item.id]=item;},removeTab:function(id){var tab=this.items[id];if(tab&&this.active==tab){for(var key in this.items){if(typeof this.items[key]!='function'&&this.items[key]!=tab){this.items[key].activate();break;}}}
this.stripEl.dom.removeChild(tab.onEl.dom);this.stripEl.dom.removeChild(tab.offEl.dom);this.bodyEl.dom.removeChild(tab.bodyEl.dom);delete this.items[id];},disableTab:function(id){var tab=this.items[id];if(tab&&this.active!=tab){tab.disable();}},enableTab:function(id){var tab=this.items[id];tab.enable();},activate:function(id){var tab=this.items[id];if(!tab.disabled){if(this.active){this.active.hide();}
this.active=this.items[id];this.active.show();this.onTabChange.fireDirect(this,this.active);}},getActiveTab:function(){return this.active;}};YAHOO.ext.TabPanelItem=function(tabPanel,id,text){this.tabPanel=tabPanel;this.id=id;this.disabled=false;this.text=text;this.loaded=false;this.bodyEl=getEl(tabPanel.createItemBody(tabPanel.bodyEl.dom,id));this.bodyEl.originalDisplay='block';this.bodyEl.setStyle('display','none');this.bodyEl.enableDisplayMode();var stripElements=tabPanel.createStripElements(tabPanel.stripEl.dom,text);this.onEl=getEl(stripElements.on,true);this.offEl=getEl(stripElements.off,true);this.onEl.originalDisplay='inline';this.onEl.enableDisplayMode();this.offEl.originalDisplay='inline';this.offEl.enableDisplayMode();this.offEl.on('click',tabPanel.activateDelegate.createCallback(id));this.onActivate=new YAHOO.util.CustomEvent('TabItem.onActivate');this.onDeactivate=new YAHOO.util.CustomEvent('TabItem.onDeactivate');};YAHOO.ext.TabPanelItem.prototype={show:function(){this.onEl.show();this.offEl.hide();this.bodyEl.show();this.onActivate.fireDirect(this.tabPanel,this);},setText:function(text){this.onEl.dom.firstChild.firstChild.firstChild.innerHTML=text;this.offEl.dom.firstChild.firstChild.innerHTML=text;},activate:function(){this.tabPanel.activate(this.id);},hide:function(){this.onEl.hide();this.offEl.show();this.bodyEl.hide();this.onDeactivate.fireDirect(this.tabPanel,this);},disable:function(){if(this.tabPanel.active!=this){this.disabled=true;this.offEl.addClass('disabled');this.offEl.dom.title='disabled';}},enable:function(){this.disabled=false;this.offEl.removeClass('disabled');this.offEl.dom.title='';},setContent:function(content){this.bodyEl.update(content);},getUpdateManager:function(){return this.bodyEl.getUpdateManager();},setUrl:function(url,params,loadOnce){this.onActivate.subscribe(this._handleRefresh.createDelegate(this,[url,params,loadOnce]));},_handleRefresh:function(url,params,loadOnce){if(!loadOnce||!this.loaded){var updater=this.bodyEl.getUpdateManager();updater.update(url,params,this._setLoaded.createDelegate(this));}},_setLoaded:function(){this.loaded=true;}};YAHOO.ext.TabPanel.prototype.createStrip=function(container){var strip=document.createElement('div');YAHOO.util.Dom.addClass(strip,'tabset');container.appendChild(strip);var stripInner=document.createElement('div');YAHOO.util.Dom.generateId(stripInner,'tab-strip');YAHOO.util.Dom.addClass(stripInner,'hd');strip.appendChild(stripInner);return stripInner;};YAHOO.ext.TabPanel.prototype.createStripList=function(strip){var list=document.createElement('ul');YAHOO.util.Dom.generateId(list,'tab-strip-list');strip.appendChild(list);return list;};YAHOO.ext.TabPanel.prototype.createBody=function(container){var body=document.createElement('div');YAHOO.util.Dom.generateId(body,'tab-body');YAHOO.util.Dom.addClass(body,'yui-ext-tabbody');container.appendChild(body);return body;};YAHOO.ext.TabPanel.prototype.createItemBody=function(bodyEl,id){var body=YAHOO.util.Dom.get(id);if(!body){body=document.createElement('div');body.id=id;}
YAHOO.util.Dom.addClass(body,'yui-ext-tabitembody');bodyEl.appendChild(body);return body;};YAHOO.ext.TabPanel.prototype.createStripElements=function(stripEl,text){var li=document.createElement('li');var a=document.createElement('a');var em=document.createElement('em');stripEl.appendChild(li);li.appendChild(a);a.appendChild(em);em.innerHTML=text;var li2=document.createElement('li');var a2=document.createElement('a');var em2=document.createElement('em');var strong=document.createElement('strong');stripEl.appendChild(li2);YAHOO.util.Dom.addClass(li2,'on');YAHOO.util.Dom.setStyle(li2,'display','none');li2.appendChild(a2);a2.appendChild(strong);strong.appendChild(em2);em2.innerHTML=text;return{on:li2,off:li};};