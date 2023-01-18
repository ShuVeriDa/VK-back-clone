import { Injectable } from '@nestjs/common';
import { FileResponseType } from './file.type';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';

@Injectable()
export class FileService {
  async saveFiles(
    files: Express.Multer.File[],
    folder = 'default',
  ): Promise<FileResponseType[]> {
    const uploadFolder = `${path}/uploads/${folder}`;

    await ensureDir(uploadFolder); // проверяет наличии папки, если она отсутствует, то создает ее.

    const res: FileResponseType[] = await Promise.all(
      files.map(async (file) => {
        await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);

        return {
          url: `/uploads/${folder}/${file.originalname}`,
          name: file.originalname,
        };
      }),
    );

    return res;
  }
}
