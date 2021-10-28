import fs from 'fs';
import path from 'path';
import moment from 'moment';

export const getCurrentDirectoryBase = (): string => {
	return path.basename(process.cwd());
};

export const directoryExists = (filePath: string): boolean => {
	return fs.existsSync(filePath);
};

/**
 * Read a local json file and return a JS object.
 * 
 * @param filePath Path of the file (Do not include '.json')
 * @returns 
 */
export const readJSONFile = async (filePath: string): Promise<Buffer> => {
	try {
		const buffer = await fs.promises.readFile(filePath + '.json', 'utf8');
		return JSON.parse(buffer);
	} catch (e) {
		throw new Error(`Error reading ${filePath}: ${e}`);
	}
};

/**
 * Save a JS object to a local json file.
 * 
 * @param fileName Name of the file (Do not include '.json')
 * @param data Object to write to file
 */
export const writeJSONToFile = async (
	fileName: string,
	data: {}
): Promise<void> => {
	try {
		await fs.promises.writeFile(fileName + '.json', JSON.stringify(data, null, 4));
	} catch (e) {
		console.error(`Error writing ${fileName}: ${e}`);
	}
};

/**
 * Appends "-YYYY-MM-DD" to the fileName.
 * 
 * @param fileName Name of the file (Do not include '.json')
 * @param data Object to write to file
 */
export const writeJSONToFileWithDate = async (
	fileName: string,
	data: {}
): Promise<void> => {
	const fileNameWithDate = `${fileName}-${moment().format('YYYY-MM-DD')}`
	await writeJSONToFile(fileNameWithDate ,data);
};

export const writeArrayToCSV = async (
	fileName: string,
	data: any[][]
): Promise<void> => {
	// Construct the comma seperated string
	// If a column values contains a comma then surround the column value by double quotes
	const csv = data
		.map((row) =>
			row
				.map(
					(item) =>
						typeof item === 'string' && item.indexOf(',') >= 0
							? `"${item}"`
							: String(item)
				)
				.join(',')
		)
		.join('\n');

	try {
		await fs.promises.writeFile(fileName + '.csv', csv);
	} catch (e) {
		console.error(`Error writing ${fileName}: ${e}`);
	}
};

export const writeMarkdownTableToFile = async (
	fileName: string,
	data: any[][]
): Promise<void> => {
	let tableString = '';

	const columnWidth = data[0].length;
	const headerDivider = '\n |' + '-------------|'.repeat(columnWidth);

	for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
		const rowDetails = data[rowIdx];
		tableString = tableString.concat('|');
		for await (const detail of rowDetails) {
			tableString = tableString.concat(detail + '|');
		}
		if (rowIdx === 0) {
			tableString = tableString.concat(headerDivider);
		}
		tableString = tableString.concat('\n');
	}

	try {
		await fs.promises.writeFile(fileName + '.md', tableString);
	} catch (e) {
		console.error(`Error writing ${fileName}: ${e}`);
	}
};
