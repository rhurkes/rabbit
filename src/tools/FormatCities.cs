using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace FormatCitiesShapefile
{
    class Program
    {
        static void Main(string[] args)
        {
            var cultureInfo = System.Threading.Thread.CurrentThread.CurrentCulture;
            var textInfo = cultureInfo.TextInfo;
            var lines = File.ReadAllLines(@"C:\Users\Sparky\Desktop\us_cities.geojson").ToList();
            // Mangle the string for easier deserialization
            lines = lines.Select(x =>
            {
                var index = x.IndexOf("},") + 1;
                x = (index > -1) ? x.Substring(0, index) : x;
                x = x.Replace("POPULATION", "stpop").Replace("NAME", "name").Replace("LON", "lon").Replace("LAT", "lat").Replace("ST", "st");
                x = x.Replace("null", "\"0\"").Replace("<Null>", "0").Replace(".0000", "");
                x = x.Replace("00, \"lat", ", \"lat").Replace("00 }", " }");
                x = x.Replace("{ \"type\": \"Feature\", \"properties\": ", "");
                return x;
            }).ToList();
            lines = lines.Where(x => x.IndexOf("pop") > -1).ToList();
            // At this point we should only have cities
            lines = lines.Select(x =>
            {
                var start = x.IndexOf(":");
                var end = x.IndexOf(",");
                var townname = x.Substring(start, end - start).Replace(": \"", "").Replace("\"", "");
                var newTownname = textInfo.ToTitleCase(townname.ToLower());
                x = x.Replace(townname, newTownname);

                return x;
            }).ToList();

            var cities = new List<City>();
            lines.ForEach(x => cities.Add(JsonConvert.DeserializeObject<City>(x)));
            cities = cities.Select(x =>
            {
                x.pop = int.Parse(x.stpop);
                return x;
            }).ToList();

            JsonSerializer _jsonWriter = new JsonSerializer
            {
                NullValueHandling = NullValueHandling.Ignore
            };

            // Parsing/formatting all done, let's write the file
            var content = "var us_cities = ";
            cities = cities.Select(x => { x.stpop = null; return x; }).ToList();
            content += JsonConvert.SerializeObject(cities, Newtonsoft.Json.Formatting.None, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore });
            content += ";";
            File.WriteAllText(@"C:\Users\Sparky\Desktop\us_cities.json", content);
        }
    }

    class City
    {
        public string name { get; set; }
        public string stpop { get; set; }
        public int pop { get; set; }
        public string st { get; set; }
        public decimal lon { get; set; }
        public decimal lat { get; set; }
    }
}
