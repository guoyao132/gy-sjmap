export default {
  //浮点数加法
  flortAdd: function (num1:number, num2:number):number {
    var r1, r2, m;
    try {r1 = num1.toString().split(".")[1].length} catch (e) {r1 = 0}
    try {r2 = num2.toString().split(".")[1].length} catch (e) {r2 = 0}
    m = Math.pow(10, Math.max(r1, r2))
    return Math.round(num1 * m + num2 * m) / m;
  },
}
