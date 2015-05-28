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
	return this.data;
};

FQL.prototype.count = function() {
	return this.data.length;
};

FQL.prototype.limit = function(lim) {
	return new FQL(this.data.slice(0, lim));
};

FQL.prototype.where = function(whereObj) {
	var results = [];

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
	return new FQL(results);
};

FQL.prototype.select = function(selArr) {
	results = [];
	for (var j = 0; j < this.data.length; j++) {
		results[j] = {};
		for(i=0; i < selArr.length; i++) {
				results[j][selArr[i]] = this.data[j][selArr[i]]
			}
		}	
	return new FQL(results);
};

FQL.prototype.order = function(key) {
	var compare = function(a,b) {
		if (a[key] > b[key]) {return 1};
		if (a[key] < b[key]) {return -1};
		if (a[key] === b[key]) {return 0};
	};
	return new FQL(this.data.sort(compare));
};