window.PPW.extend("chart", (function(){
    
    var _ppw;

    var _compareCaseInsensitive = function(x, y){
        return x.toLowerCase() == y.toLowerCase();
    };

    var _render = function(element, type, chartData, chartOptions){
        var ctx = $(element).get(0).getContext("2d");

        if(_compareCaseInsensitive(type, 'Line'))
            new Chart(ctx).Line(chartData, chartOptions);

        if(_compareCaseInsensitive(type, 'Bar'))
            new Chart(ctx).Bar(chartData, chartOptions);

        if(_compareCaseInsensitive(type, 'Radar'))
            new Chart(ctx).Radar(chartData, chartOptions);

        if(_compareCaseInsensitive(type, 'PolarArea'))
            new Chart(ctx).PolarArea(chartData, chartOptions);

        if(_compareCaseInsensitive(type, 'Pie'))
            new Chart(ctx).Pie(chartData, chartOptions);
                    
        if(_compareCaseInsensitive(type, 'Doughnut'))
            new Chart(ctx).Doughnut(chartData, chartOptions);
    };

    var _setup= function(ppw){
        _ppw= ppw;
        ppw.PPWSrc = '../../ppw/';
        conf= PPW.get('charts');

        var chartScript = [ppw.PPWSrc+'/_addons/chartjs/Chart.min.js'];
        $.getScript(chartScript);

        $(window).load(function() {            
            for (var i = 0; i < conf.length; i++) {
                _render(conf[i].element, conf[i].type, conf[i].chartData, conf[i].chartOptions);
            };
        });
        
    };

    return {
        onload: _setup
    };
    
})());