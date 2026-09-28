using JobMagnet.Application.DTOs.Common;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace JobMagnet.Application.Helpers
{
    public static class PaginationHelper
    {
        public static async Task<PagedResult<T>> CreatePagedResultAsync<T>(
            IQueryable<T> source, 
            int pageNumber, 
            int pageSize)
        {
            var count = await source.CountAsync();
            var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<T>
            {
                Items = items,
                TotalCount = count,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}
