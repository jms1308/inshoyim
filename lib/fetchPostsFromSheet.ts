export async function fetchPostsFromSheet(): Promise<Record<string, string>[]> {
  const apiKey = 'AIzaSyAXuXeTyq6595HH7dVf3reWCehTgtwqG8A';
  const spreadsheetId = '1RTDiNdcgQ7oetYcBN_QqQfo7xivM9S-tnueGVlBAjOU';
  const range = 'Sheet1!A1:Z1000'; // Increased range for more essays

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  console.log('Fetching from Google Sheets:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Google Sheets response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);
      throw new Error(`Failed to fetch data from Google Sheets: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Google Sheets data received:', {
      hasValues: !!data.values,
      rowCount: data.values?.length || 0,
      headers: data.values?.[0] || [],
      sampleRow: data.values?.[1] || []
    });

    if (!data.values || data.values.length === 0) {
      console.log('No data found in Google Sheets');
      return [];
    }

    const [headers, ...rows]: [string[], ...string[][]] = data.values;
    console.log('Google Sheets headers:', headers);
    console.log('Google Sheets first row:', rows[0]);
    
    const result = rows.map((row: string[]) =>
      headers.reduce((obj: Record<string, string>, header: string, i: number) => {
        obj[header] = row[i] || '';
        return obj;
      }, {} as Record<string, string>)
    );
    
    console.log('Processed rows count:', result.length);
    return result;
    
  } catch (error) {
    console.error('Error fetching posts from Google Sheets:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return [];
  }
} 