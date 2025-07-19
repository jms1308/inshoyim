export async function fetchPostsFromSheet(): Promise<Record<string, string>[]> {
  const apiKey = 'AIzaSyAXuXeTyq6595HH7dVf3reWCehTgtwqG8A';
  const spreadsheetId = '1RTDiNdcgQ7oetYcBN_QqQfo7xivM9S-tnueGVlBAjOU';
  const range = 'Sheet1!A1:Z100';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch data from Google Sheets');
    const data = await response.json();

    if (!data.values || data.values.length === 0) return [];

    const [headers, ...rows]: [string[], ...string[][]] = data.values;
    return rows.map((row: string[]) =>
      headers.reduce((obj: Record<string, string>, header: string, i: number) => {
        obj[header] = row[i] || '';
        return obj;
      }, {} as Record<string, string>)
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
} 