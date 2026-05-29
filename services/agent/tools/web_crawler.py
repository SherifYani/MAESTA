"""
Web Crawler Service - Crawls websites and extracts content for indexing
"""
import time
import re
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Set, Optional
from dataclasses import dataclass
import requests  # type: ignore
from bs4 import BeautifulSoup  # type: ignore

import config
from core.logger import get_logger
from core.exceptions import WebCrawlerError

logger = get_logger(__name__)


@dataclass
class CrawledPage:
    """Represents a crawled page"""
    url: str
    title: str
    content: str
    links: List[str]


class WebCrawlerService:
    """Service for crawling websites and extracting content"""
    
    def __init__(self):
        self.max_depth = config.MAX_CRAWL_DEPTH
        self.max_pages = config.MAX_CRAWL_PAGES
        self.delay = config.CRAWL_DELAY_SECONDS
        self.timeout = config.CRAWL_TIMEOUT_SECONDS
        self.chunk_size = config.CHUNK_SIZE
        self.chunk_overlap = config.CHUNK_OVERLAP
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
    
    def crawl_website(self, base_url: str, max_depth: int | None = None, 
                      max_pages: int | None = None) -> dict:
        """
        Crawl a website starting from base_url
        
        Args:
            base_url: The starting URL
            max_depth: Maximum depth to crawl (default from config)
            max_pages: Maximum pages to crawl (default from config)
        
        Returns:
            Dict with crawl results including pages and chunks
        """
        max_depth = max_depth or self.max_depth
        max_pages = max_pages or self.max_pages
        
        logger.info(f"Starting crawl of {base_url} (depth={max_depth}, max_pages={max_pages})")
        
        # Normalize base URL
        parsed = urlparse(base_url)
        if not parsed.scheme:
            base_url = 'https://' + base_url
            parsed = urlparse(base_url)
        
        base_domain = parsed.netloc
        
        # Normalize: remove index.php from base_url
        base_url = re.sub(r'/index\.php/?$', '/', base_url)
        base_url = base_url.rstrip('/')
        
        visited: Set[str] = set()
        to_visit: List[tuple] = [(base_url, 0)]  # (url, depth)
        crawled_pages: List[CrawledPage] = []
        all_chunks: List[Dict] = []
        
        while to_visit and len(crawled_pages) < max_pages:
            current_url, depth = to_visit.pop(0)
            
            # Skip if already visited
            if current_url in visited:
                continue
            
            # Skip if too deep
            if depth > max_depth:
                continue
            
            visited.add(current_url)
            
            try:
                page = self._fetch_page(current_url)
                if page:
                    crawled_pages.append(page)
                    
                    # Create chunks from this page
                    page_chunks = self._create_chunks(
                        page.content, 
                        page.url,
                        page.title
                    )
                    all_chunks.extend(page_chunks)
                    
                    logger.info(f"Crawled {current_url}: {len(page_chunks)} chunks")
                    
                    # Add internal links to queue
                    if depth < max_depth:
                        for link in page.links:
                            if self._is_internal_link(link, base_domain):
                                if link not in visited:
                                    to_visit.append((link, depth + 1))
                    
                    # Respect rate limiting
                    time.sleep(self.delay)
                    
            except Exception as e:
                logger.warning(f"Failed to crawl {current_url}: {e}")
                continue
        
        result = {
            'base_url': base_url,
            'pages_crawled': len(crawled_pages),
            'total_chunks': len(all_chunks),
            'chunks': all_chunks,
            'pages': [{'url': p.url, 'title': p.title} for p in crawled_pages]
        }
        
        logger.info(f"Crawl complete: {result['pages_crawled']} pages, {result['total_chunks']} chunks")
        return result
    
    def _fetch_page(self, url: str) -> Optional[CrawledPage]:
        """Fetch and parse a single page using Scrapling"""
        try:
            from scrapling.fetchers import Fetcher
            
            # Scrapling handles headers, impersonation, and parsing automatically
            # We use impersonate='chrome' for better stealth
            page = Fetcher.get(url, timeout=self.timeout)
            
            if not page or page.status != 200:
                logger.warning(f"Failed to fetch {url}: Status {page.status if page else 'None'}")
                return None
            
            # Check content type if possible (Scrapling result objects have headers)
            # Scrapling usually returns a Selector object which makes it easy to work with
            
            # Extract title
            title = page.css('title::text').get() or url
            
            # Extract clean text content using Scrapling's powerful selectors
            # We want to remove boilerplate like nav, footer, etc.
            content = self._extract_text_scrapling(page)
            
            # Extract links for further crawling
            links = []
            for a_tag in page.css('a[href]'):
                href = a_tag.attrib.get('href')
                if href and not href.startswith(('#', 'javascript:', 'mailto:', 'tel:')):
                    # Convert to absolute URL
                    full_url = urljoin(url, href).split('#')[0]
                    # Normalize: remove index.php and trailing slashes
                    full_url = re.sub(r'/index\.php/?$', '/', full_url)
                    full_url = full_url.rstrip('/')
                    
                    # Filter common non-content extensions
                    if not any(full_url.lower().endswith(ext) for ext in 
                              ['.pdf', '.jpg', '.png', '.gif', '.zip', '.exe', '.css', '.js']):
                        links.append(full_url)
            
            return CrawledPage(
                url=url,
                title=title.strip(),
                content=content,
                links=list(set(links))
            )
            
        except Exception as e:
            logger.warning(f"Scrapling failed for {url}: {e}")
            return None

    def _extract_text_scrapling(self, page) -> str:
        """Extract clean text from page using Scrapling selectors"""
        try:
            # Try to find main content area first. css() returns Selectors (list-like)
            # .first returns the first Selector or None
            main = page.css('main').first or page.css('article').first or page
            
            if not main:
                return ""
                
            # Use get_all_text() with ignore_tags
            text = main.get_all_text(
                separator='\n',
                ignore_tags=('script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript', 'iframe', 'button', 'form')
            )
            
            # Common university website boilerplate to filter out
            boilerplate = [
                'تجاوز إلى المحتوى الرئيسي',
                'المحتوى الرئيسي',
                'Content Builder',
                'المزيد كلمة نائب رئيس',
                'مرحبًا بكم في جامعة أسيوط',
                'جميع الحقوق محفوظة',
                'Powered by',
                'Skip to main content'
            ]
            
            # Filter boilerplate lines
            lines = []
            for line in text.splitlines():
                line = line.strip()
                if not line:
                    continue
                # Skip if line is exactly one of the boilerplate strings or starts with them
                if any(bp in line for bp in boilerplate):
                    continue
                lines.append(line)
            
            text = '\n'.join(lines)
            
            # Clean up redundant spaces and newlines
            text = re.sub(r' +', ' ', text)
            text = re.sub(r'\n{3,}', '\n\n', text)
            
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text with Scrapling: {e}")
            return ""
    
    def _is_internal_link(self, url: str, base_domain: str) -> bool:
        """Check if URL is internal to the base domain"""
        try:
            parsed = urlparse(url)
            return parsed.netloc == base_domain or parsed.netloc == ''
        except:
            return False
    
    def _create_chunks(self, text: str, source_url: str, title: str) -> List[Dict]:
        """Split text into overlapping chunks using recursive splitting strategy"""
        if not text.strip():
            return []
        
        # Level 1: Initial split by double newlines (paragraphs)
        initial_splits = [s.strip() for s in text.split('\n\n') if s.strip()]
        
        # Helper to refine splits if they exceed chunk_size
        def refine_splits(splits, separator, max_len):
            new_splits = []
            for s in splits:
                if len(s) > max_len:
                    if separator == '':
                        # Hard character split as last resort
                        for i in range(0, len(s), max_len):
                            new_splits.append(s[i:i+max_len])
                    else:
                        sub_splits = [sub.strip() for sub in s.split(separator) if sub.strip()]
                        if not sub_splits:
                            # If splitting didn't help (e.g. separator not found), keep original
                            new_splits.append(s)
                        else:
                            # Re-add separator for readability if it's sentence-like
                            if separator in ['. ', '? ', '! ']:
                                sub_splits = [sub + separator.strip() for sub in sub_splits]
                            new_splits.extend(sub_splits)
                else:
                    new_splits.append(s)
            return new_splits

        # Apply hierarchical splitting
        splits = initial_splits
        
        # 1. Split large paragraphs by lines
        splits = refine_splits(splits, '\n', self.chunk_size)
        
        # 2. Split large lines by sentences (approximated by '. ')
        splits = refine_splits(splits, '. ', self.chunk_size)
        
        # 3. Split by spaces
        splits = refine_splits(splits, ' ', self.chunk_size)
        
        # 4. Fallback: hard char split
        splits = refine_splits(splits, '', self.chunk_size)
        
        # Re-assemble into chunks of target size
        chunks = []
        current_chunk_text = ""
        current_chunk_index = 0
        
        for split in splits:
            split = split.strip()
            if not split:
                continue
                
            # Estimate new length (plus a space separator)
            potential_len = len(current_chunk_text) + len(split) + 1
            
            if potential_len > self.chunk_size:
                # Current chunk is full, save it
                if current_chunk_text:
                    chunks.append({
                        'index': current_chunk_index,
                        'content': current_chunk_text,
                        'metadata': f"Source: {title} ({source_url}), Chunk: {current_chunk_index + 1}"
                    })
                    current_chunk_index += 1
                    
                    # Handle overlap for the next chunk
                    if self.chunk_overlap > 0 and len(current_chunk_text) > self.chunk_overlap:
                        # Keep the last portion of the text
                        overlap_text = current_chunk_text[-self.chunk_overlap:]
                        # Try to cut cleanly at a space
                        first_space = overlap_text.find(' ')
                        if first_space != -1 and first_space < len(overlap_text) - 1:
                            overlap_text = overlap_text[first_space+1:]
                        current_chunk_text = overlap_text + " " + split
                    else:
                        current_chunk_text = split
                else:
                    # Edge case: split itself is larger than chunk size (unlikely due to step 4)
                    chunks.append({
                        'index': current_chunk_index,
                        'content': split[:self.chunk_size],
                        'metadata': f"Source: {title} ({source_url}), Chunk: {current_chunk_index + 1}"
                    })
                    current_chunk_index += 1
            else:
                if current_chunk_text:
                    current_chunk_text += " " + split
                else:
                    current_chunk_text = split
                    
        # Add the final chunk
        if current_chunk_text:
             chunks.append({
                'index': current_chunk_index,
                'content': current_chunk_text,
                'metadata': f"Source: {title} ({source_url}), Chunk: {current_chunk_index + 1}"
            })
            
        return chunks
    
    def crawl_single_page(self, url: str) -> Dict:
        """Crawl just a single page (no following links)"""
        logger.info(f"Crawling single page: {url}")
        
        page = self._fetch_page(url)
        if not page:
            raise WebCrawlerError(url, "Failed to fetch page")
        
        chunks = self._create_chunks(page.content, page.url, page.title)
        
        return {
            'base_url': url,
            'pages_crawled': 1,
            'total_chunks': len(chunks),
            'chunks': chunks,
            'pages': [{'url': page.url, 'title': page.title}]
        }

    def get_tables_html(self, url: str) -> List[str]:
        """Extract all <table> elements from a URL as HTML strings"""
        logger.info(f"Extracting tables from: {url}")
        try:
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            tables = soup.find_all('table')
            
            # Convert each table tag to string
            return [str(table) for table in tables]
        except Exception as e:
            logger.error(f"Failed to extract tables from {url}: {e}")
            return []


# Singleton instance
web_crawler = WebCrawlerService()
