window.PPW.extend("chart", (function(){

    var _ppw,
        _defaultChart= {
            type : 'line',
            chartOptions : {
                animation: true
            },
            chartData : {
            }
        },
        conf= null;

    var _render = function(element, type, chartData, chartOptions){

        var ctx = $(element)[0].getContext("2d");

        switch(type.toLowerCase()){
            case 'line':
                new Chart(ctx).Line(chartData, chartOptions);
                break;
            case 'bar':
                new Chart(ctx).Bar(chartData, chartOptions);
                break;
            case 'radar':
                new Chart(ctx).Radar(chartData, chartOptions);
                break;
            case 'polararea':
                new Chart(ctx).PolarArea(chartData, chartOptions);
                break;
            case 'pie':
                new Chart(ctx).Pie(chartData, chartOptions);
                break;
            case 'doughnut':
                new Chart(ctx).Doughnut(chartData, chartOptions);
                break;
        }

    };

    var _setup= function(ppw){
        _ppw= ppw;
        ppw.PPWSrc = '../../ppw/';
        conf= PPW.get('charts');

        var chartScript = [ppw.PPWSrc+'/_addons/chartjs/Chart.min.js'];
        $.getScript(chartScript, function(){});

        PPW.addListener('onslidechange', function(data) {
                var list= $(data.current.el).find('.ppw-chart');
                list.each(function(){

                    var o= this.innerHTML.replace(/([a-zA-Z0-9\-_]+)( )?\:/g, '"$1":').replace(/\t|\n|\r/g, '');

                    try{
                        o= JSON.parse(o);
                    }catch(e){
                        console.error("[PPW] Charts - Could not parse the char data!", this.innerHTML, e);
                    }

                    o= $.extend({}, _defaultChart, {chartData: o||{}}, {element: this});

                    if(o.chartData.type)
                        o.type= o.chartData.type;
                    else
                        o.type= _defaultChart.type;

                    if(o.chartData.chartOptions)
                        o.chartOptions= o.chartData.chartOptions;

                    if(o.chartData.data && o.chartData.data.length){
                        // is an array, not an object
                        o.chartData= o.chartData.data;
                    }

                    _render(o.element, o.type, o.chartData, o.chartOptions);
                })
        });


    };

    return {
        onload: _setup
    };

})());