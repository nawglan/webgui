/*
 * YUI Extensions
 * Copyright(c) 2006, Jack Slocum.
 * 
 * This code is licensed under BSD license. 
 * http://www.opensource.org/licenses/bsd-license.php
 */


YAHOO.ext.grid.DefaultDataModel=function(data){YAHOO.ext.grid.DefaultDataModel.superclass.constructor.call(this);this.data=data;};YAHOO.extendX(YAHOO.ext.grid.DefaultDataModel,YAHOO.ext.grid.AbstractDataModel);YAHOO.ext.grid.DefaultDataModel.prototype.getRowCount=function(){return this.data.length;};YAHOO.ext.grid.DefaultDataModel.prototype.getRowId=function(rowIndex){return this.data[rowIndex][0];};YAHOO.ext.grid.DefaultDataModel.prototype.getRow=function(rowIndex){return this.data[rowIndex];};YAHOO.ext.grid.DefaultDataModel.prototype.getRows=function(indexes){var data=this.data;var r=[];for(var i=0;i<indexes.length;i++){r.push(data[indexes[i]]);}
return r;};YAHOO.ext.grid.DefaultDataModel.prototype.getValueAt=function(rowIndex,colIndex){return this.data[rowIndex][colIndex];};YAHOO.ext.grid.DefaultDataModel.prototype.setValueAt=function(value,rowIndex,colIndex){this.data[rowIndex][colIndex]=value;this.fireCellUpdated(rowIndex,colIndex);};YAHOO.ext.grid.DefaultDataModel.prototype.removeRows=function(startIndex,endIndex){endIndex=endIndex||startIndex;this.data.splice(startIndex,endIndex-startIndex+1);this.fireRowsDeleted(startIndex,endIndex);};YAHOO.ext.grid.DefaultDataModel.prototype.removeRow=function(index){this.data.splice(index,1);this.fireRowsDeleted(index,index);};YAHOO.ext.grid.DefaultDataModel.prototype.removeAll=function(){var count=this.getRowCount();if(count>0){this.removeRows(0,count-1);}};YAHOO.ext.grid.DefaultDataModel.prototype.query=function(spec,returnUnmatched){var d=this.data;var r=[];for(var i=0;i<d.length;i++){var row=d[i];var isMatch=true;for(var col in spec){if(typeof spec[col]!='function'){if(!isMatch)continue;var filter=spec[col];switch(typeof filter){case'string':case'number':case'boolean':if(row[col]!=filter){isMatch=false;}
break;case'function':if(!filter(row[col],row)){isMatch=false;}
break;case'object':if(filter instanceof RegExp){if(String(row[col]).search(filter)===-1){isMatch=false;}}
break;}}}
if(isMatch&&!returnUnmatched){r.push(i);}else if(!isMatch&&returnUnmatched){r.push(i);}}
return r;};YAHOO.ext.grid.DefaultDataModel.prototype.filter=function(query){var matches=this.query(query,true);var data=this.data;for(var i=0;i<matches.length;i++){data[matches[i]]._deleted=true;}
for(var i=0;i<data.length;i++){while(data[i]&&data[i]._deleted===true){this.removeRow(i);}}
return matches.length;};YAHOO.ext.grid.DefaultDataModel.prototype.addRow=function(cellValues){this.data.push(cellValues);var newIndex=this.data.length-1;this.fireRowsInserted(newIndex,newIndex);this.applySort();return newIndex;};YAHOO.ext.grid.DefaultDataModel.prototype.addRows=function(rowData){this.data=this.data.concat(rowData);var firstIndex=this.data.length-rowData.length;this.fireRowsInserted(firstIndex,firstIndex+rowData.length-1);this.applySort();};YAHOO.ext.grid.DefaultDataModel.prototype.insertRow=function(index,cellValues){this.data.splice(index,0,cellValues);this.fireRowsInserted(index,index);this.applySort();return index;};YAHOO.ext.grid.DefaultDataModel.prototype.insertRows=function(index,rowData){var args=rowData.concat();args.splice(0,0,index,0);this.data.splice.apply(this.data,args);this.fireRowsInserted(index,index+rowData.length-1);this.applySort();};YAHOO.ext.grid.DefaultDataModel.prototype.applySort=function(suppressEvent){if(this.columnModel&&typeof this.sortColumn!='undefined'){this.sort(this.columnModel,this.sortColumn,this.sortDir,suppressEvent);}};YAHOO.ext.grid.DefaultDataModel.prototype.setDefaultSort=function(columnModel,columnIndex,direction){this.columnModel=columnModel;this.sortColumn=columnIndex;this.sortDir=direction;};YAHOO.ext.grid.DefaultDataModel.prototype.sort=function(columnModel,columnIndex,direction,suppressEvent){this.columnModel=columnModel;this.sortColumn=columnIndex;this.sortDir=direction;var dsc=direction=='DESC';var sortType=columnModel.getSortType(columnIndex);var fn=function(cells,cells2){var v1=sortType(cells[columnIndex],cells);var v2=sortType(cells2[columnIndex],cells2);if(v1<v2)
return dsc?-1:+1;if(v1>v2)
return dsc?+1:-1;return 0;};this.data.sort(fn);if(!suppressEvent){this.fireRowsSorted(columnIndex,direction);}};