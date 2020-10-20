function getParameterNames(fn) {
	if (typeof fn !== "function") return [];
	var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
	var code = fn.toString().replace(COMMENTS, "");
	var result = code
		.slice(code.indexOf("(") + 1, code.indexOf(")"))
		.match(/([^\s,]+)/g);
	return result === null ? [] : result;
}

function codeFormat(value) {
	var moduleExports = eval(
		"var module = {};var require=function(){}\n" + value
	);

	if (typeof moduleExports == "function") {
		let parameter = getParameterNames(moduleExports);
		let parameterStr = parameter.length ? "," + parameter.join(",") : "";
		return `module.exports = async function(callback, system ${parameterStr}) {

						if(!system) {
							system = {};
						}

						if(!system.channel) {
							system.channel = {};
						}
	
						if(!system.debugs) {
							system.debugs = [];
						}
	
						if(!system.notifys) {
							system.notifys = [];
						}

						system.Notify = function(channel, message) {
						  system.notifys.push({
							channel: channel.toString(),
							message: message.toString()
						  });
						};

						var console = {
							log:function() {
								if (system.isdebug){
									if (arguments.length) {
										system.debugs.push(arguments.length == 1 ? arguments[0] : arguments);
									}
								}
							}
						};

                      ${value.replace(/module.exports/g, 'var module_exports_action')}
                       module_exports_action = module_exports_action.bind(system);
                      try{
                        system.result = await module_exports_action(${parameter.join(
			","
		)});
                      } catch(ex) {
                        callback(ex, null); 
                      }

					if (system.notifys.length) {
					  system.notifys = JSON.stringify(system.notifys);
					} else {
					  system.notifys = "";
					}

                      callback(null, system);
              }`;
	} else if (typeof moduleExports == "object") {
		var functionstr = [];
		var headerContent = value.split("module.exports")[0];
		for (const key in moduleExports) {
			let keyName = key.toLowerCase();
			const moduleObject = moduleExports[key];
			if (typeof moduleObject == "function") {
				let parameter = getParameterNames(moduleObject);
				let parameterStr = parameter.length
					? "," + parameter.join(",")
					: "";
				functionstr.push(`${keyName}: async function(callback, system ${parameterStr}) {

						if(!system) {
							system = {};
						}

						if(!system.channel) {
							system.channel = {};
						}
	
						if(!system.debugs) {
							system.debugs = [];
						}
	
						if(!system.notifys) {
							system.notifys = [];
						}

						system.Notify = function(channel, message) {
						  system.notifys.push({
							channel: channel.toString(),
							message: message.toString()
						  });
						};

						var console = {
							log:function() {
								if (system.isdebug){
									if (arguments.length) {
										system.debugs.push(arguments.length == 1 ? arguments[0] : arguments);
									}
								}
							}
						};

                      var module_exports_action = ${moduleObject.toString()}.bind(system);
                      try{
                        system.result = await module_exports_action(${parameter.join(
					","
				)});
                      } catch(ex) {
                        callback(ex, null); 
                      }

					if (system.notifys.length) {
					  system.notifys = JSON.stringify(system.notifys);
					} else {
					  system.notifys = "";
					}

                      callback(null, system);
              }`);
			} else {
				functionstr.push(`${key}:${moduleObject}`);
			}
		}
		return `${headerContent} \n module.exports = { ${functionstr.join(
			","
		)} }`;
	}
}

module.exports = function (callback, code) {
	callback(null, codeFormat(code));
}