// Place your code here:

// Adds properties of obj2 into obj1
function merge(obj1, obj2) {
	var obj3 = {};
	for (var attr in obj1) {
		obj3[attr] = obj1[attr];
	};
	for (var attr in obj2) {
		obj3[attr] = obj2[attr];
	};
	return obj3;
};

var FQL = function(data) {
	this.data = data;
};

FQL.prototype.exec = function() {
	return this.data.slice();
};

FQL.prototype.count = function() {
	return this.exec().length;
};

FQL.prototype.limit = function(lim) {
	return new FQL(this.exec().slice(0, lim));
};

FQL.prototype.where = function(whereObj) {
	var results = [];
	var unindexed = this.data;
	if(this.indexTable === undefined) {
		for (var j = 0; j < this.data.length; j++) {
			var keep = true;
			for(key in whereObj) {
				if(typeof whereObj[key] !== "function") {
					if (this.data[j][key] !== whereObj[key]) {
						keep = false;
					}
				} else if (!whereObj[key](this.data[j][key])) {
						keep=false;
					}
				}
			if(keep) { results.push(this.data[j]) }
		}
	} else {
		for(idxName in this.indexTable) {
			for(key in whereObj) {
				if(key === idxName) {
					// console.log("where");
					//console.log(this.getIndicesOf(key, whereObj[key]));
					var resultsArr = this.getIndicesOf(key, whereObj[key]);
					//console.log(resultsArr);
					results = resultsArr.map(function(val) {
						return unindexed[val];
					})
				}
			}
		}
	}
	return new FQL(results);
};

FQL.prototype.select = function(selArr) {
	//iterative approach

	// results = [];
	// for (var j = 0; j < this.data.length; j++) {
	// 	results[j] = {};
	// 	for(i=0; i < selArr.length; i++) {
	// 			results[j][selArr[i]] = this.data[j][selArr[i]]
	// 		}
	// 	}	

	//map approach

	var table = this.data.map(function(row) {
		var newRow = {};
		for (var j = 0; j < selArr.length; j++) {
			var selItem = selArr[j];
			newRow[selItem] = row[selItem];
		}
		return newRow;
	})
	return new FQL(table);
};

FQL.prototype.order = function(key) {
	var compare = function(a,b) {
		return a[key] - b[key];
	};
	return new FQL(this.data.sort(compare));
};

FQL.prototype.left_join = function(joinTable, joinFunc) {
	var results = [];
	for (var j = 0; j < this.data.length; j++) {
		for(i=0; i < joinTable.data.length; i++) {
			if(joinFunc(this.data[j],joinTable.data[i])) {
				results.push(merge(this.data[j],joinTable.data[i]));
			}
		}
	}
	return new FQL(results);
};

FQL.prototype.addIndex = function(colName) {
	var attr = this.select(colName.split(","));
	results = {};
	this.indexTable = {};
	this.indexTable[colName] = {};
	for(var idx in attr.data) {
		if(!results[attr.data[idx][colName]]){
			results[attr.data[idx][colName]] = [];
		}
		results[attr.data[idx][colName]].push(parseInt(idx));
	}
	this.indexTable[colName] = results;
	return this;
};

FQL.prototype.getIndicesOf = function(colName, colVal) {
	if(!this.indexTable || !this.indexTable[colName]) {
		return undefined;
	}
	return this.indexTable[colName][colVal];
};